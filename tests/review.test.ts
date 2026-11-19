import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyProgress,
  parseProgress,
  markRead,
  toggleBookmark,
  recordAnswer,
  inReview,
  PROGRESS_KEY,
  LEGACY_PROGRESS_KEY,
  BACKUP_KEY,
  SESSION_KEY,
  storedRaw,
} from '../src/lib/progress';
import {
  exportProgress,
  previewImport,
  replaceProgress,
  MAX_BACKUP_BYTES,
} from '../src/lib/backup';
import { createSession, restoreSession, answerSession, evaluate } from '../src/lib/practice';
import type { Question } from '../src/lib/schema';
const q: Question = {
  id: 'topic-mcq',
  topicId: 'topic',
  type: 'mcq',
  prompt: 'test question',
  choices: [
    { id: 'a', text: 'yes' },
    { id: 'b', text: 'no' },
  ],
  correct: 'a',
  explanation: 'explanation',
};
const oral: Question = {
  id: 'topic-oral',
  topicId: 'topic',
  type: 'oral',
  prompt: 'explain',
  rubric: ['a', 'b'],
  explanation: 'explanation',
};
function storage(initial: Record<string, string> = {}, fail?: string): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    key(n) {
      return [...data.keys()][n] ?? null;
    },
    getItem(k) {
      return data.get(k) ?? null;
    },
    setItem(k, v) {
      if (k === fail) throw Error('quota');
      data.set(k, v);
    },
    removeItem(k) {
      data.delete(k);
    },
  };
}
test('S1迁移保留阅读、累计成绩和自评，不捏造错题', () => {
  const raw = JSON.stringify({
    version: 1,
    topics: {
      topic: {
        readAt: 100,
        practicedAt: 101,
        objective: { attempts: 8, correct: 5 },
        self: 'partial',
      },
    },
    lastTopic: 'topic',
  });
  const s = storage({ [LEGACY_PROGRESS_KEY]: raw });
  const p = parseProgress(storedRaw(s)).progress;
  assert.equal(p.version, 2);
  assert.equal(p.topics.topic.readAt, 100);
  assert.deepEqual(p.topics.topic.objective, { attempts: 8, correct: 5 });
  assert.equal(p.topics.topic.self, 'partial');
  assert.deepEqual(p.questions, {});
  s.setItem(PROGRESS_KEY, JSON.stringify(p));
  assert.equal(s.getItem(LEGACY_PROGRESS_KEY), raw);
});
test('收藏独立于阅读与练习，取消收藏不清除成绩', () => {
  let p = toggleBookmark(emptyProgress(), 'topic', 100);
  assert.deepEqual(p.topics, {});
  assert.equal(inReview(p, q, 'bookmarks'), true);
  p = markRead(p, 'topic', true, 101);
  p = recordAnswer(p, 'topic', evaluate(q, 'a'), 102, q.id, 'first');
  p = toggleBookmark(p, 'topic');
  assert.equal(inReview(p, q, 'bookmarks'), false);
  assert.equal(p.topics.topic.readAt, 101);
  assert.equal(p.topics.topic.objective.correct, 1);
});
test('逐题错题、自评、到期分开，重答正确清除错题但保留历史成绩', () => {
  let p = recordAnswer(emptyProgress(), 'topic', evaluate(q, 'b'), 100, q.id, 'one');
  assert.equal(inReview(p, q, 'mistakes'), true);
  assert.equal(inReview(p, q, 'due', 100), true);
  assert.equal(inReview(p, q, 'reinforce'), false);
  p = recordAnswer(p, 'topic', evaluate(q, 'a'), 200, q.id, 'two');
  assert.equal(inReview(p, q, 'mistakes'), false);
  assert.equal(inReview(p, q, 'due', 200), false);
  assert.equal(inReview(p, q, 'due', 200 + 86400000), true);
  assert.deepEqual(p.topics.topic.objective, { attempts: 2, correct: 1 });
  p = recordAnswer(p, 'topic', { kind: 'self', rating: 'partial' }, 300, oral.id, 'three');
  assert.equal(inReview(p, oral, 'reinforce'), true);
  assert.equal(inReview(p, oral, 'mistakes'), false);
  assert.equal(inReview(p, oral, 'due', 300), false);
  assert.equal(inReview(p, oral, 'due', 300 + 86400000), true);
  assert.deepEqual(p.topics.topic.objective, { attempts: 2, correct: 1 });
});
test('复习间隔为1/3/7/14天，错误重置，同一提交不重复累计', () => {
  let p = emptyProgress();
  for (const [i, days] of [1, 3, 7, 14, 14].entries()) {
    p = recordAnswer(p, 'topic', evaluate(q, 'a'), 100, q.id, `attempt-${i}`);
    assert.equal(p.questions[q.id].dueAt, 100 + days * 86400000);
  }
  const same = recordAnswer(p, 'topic', evaluate(q, 'a'), 200, q.id, 'attempt-4');
  assert.equal(same, p);
  p = recordAnswer(p, 'topic', evaluate(q, 'b'), 300, q.id, 'wrong');
  assert.equal(p.questions[q.id].streak, 0);
  assert.equal(p.questions[q.id].dueAt, 300);
  p = recordAnswer(p, 'topic', { kind: 'self', rating: 'again' }, 301, oral.id, 'oral');
  assert.equal(p.questions[oral.id].dueAt, 301);
});
test('队列中已纠正的题仍能恢复当前练习，导入后旧会话失效', () => {
  let s = createSession([q], 'mode:mistakes');
  s.generation = 'initial';
  s = answerSession(s, evaluate(q, 'a'));
  const p = recordAnswer(emptyProgress(), 'topic', evaluate(q, 'a'), 100, q.id, 'attempt');
  assert.equal(inReview(p, q, 'mistakes'), false);
  assert.deepEqual(restoreSession(JSON.stringify(s), [q], 'mode:mistakes', 'initial'), s);
  assert.equal(restoreSession(JSON.stringify(s), [q], 'mode:mistakes', 'import-generation'), null);
});
test('导出导入往返，重复导入只替换且保存导入前原文', () => {
  let p = recordAnswer(emptyProgress(), 'topic', evaluate(q, 'b'), 100, q.id, 'first');
  p = toggleBookmark(markRead(p, 'topic', true, 101), 'topic', 102);
  const raw = exportProgress(p, new Date(0));
  const preview = previewImport(raw, ['topic'], [q]);
  assert.deepEqual(preview.progress, p);
  const previous = JSON.stringify({ version: 1, topics: {} });
  const s = storage({ [LEGACY_PROGRESS_KEY]: previous, [SESSION_KEY]: 'old session' });
  const imported = replaceProgress(preview.progress, s, 'new');
  assert.equal(s.getItem(BACKUP_KEY), previous);
  assert.equal(s.getItem(SESSION_KEY), null);
  replaceProgress(preview.progress, s, 'newer');
  assert.equal(parseProgress(s.getItem(PROGRESS_KEY)).progress.topics.topic.objective.attempts, 1);
  assert.equal(imported.bookmarks.topic, 102);
  assert.equal(s.getItem(LEGACY_PROGRESS_KEY), previous);
});
test('坏文件、未知版本、错误题型和危险键不进入导入，未知ID明确跳过', () => {
  for (const raw of [
    '{',
    'null',
    '{"version":99}',
    '{"version":2,"topics":{}}',
    '{"version":1,"topics":{"__proto__":{"objective":{"attempts":0,"correct":0}}}}',
    JSON.stringify({ app: 'other', format: 1, progress: emptyProgress() }),
  ])
    assert.throws(() => previewImport(raw, ['topic'], [q]));
  assert.throws(() => previewImport(' '.repeat(MAX_BACKUP_BYTES + 1), ['topic'], [q]));
  let p = toggleBookmark(
    markRead(emptyProgress(), 'removed-topic', true, 100),
    'removed-topic',
    100,
  );
  p = recordAnswer(p, 'removed-topic', evaluate(q, 'a'), 100, 'removed-mcq', 'x');
  const imported = previewImport(exportProgress(p), ['topic'], [q]);
  assert.equal(imported.skipped, 3);
  assert.deepEqual(imported.progress.topics, {});
  const wrong = recordAnswer(
    emptyProgress(),
    'topic',
    { kind: 'self', rating: 'again' },
    100,
    q.id,
    'x',
  );
  assert.throws(() => previewImport(exportProgress(wrong), ['topic'], [q]));
});
test('备份或替换写入失败保留现有记录；明确导入可替换损坏记录且保留原文', () => {
  const previous = '{damaged';
  for (const key of [BACKUP_KEY, PROGRESS_KEY]) {
    const s = storage({ [PROGRESS_KEY]: previous, [SESSION_KEY]: 'session' }, key);
    assert.throws(() => replaceProgress(emptyProgress(), s, 'next'));
    assert.equal(s.getItem(PROGRESS_KEY), previous);
    assert.equal(s.getItem(SESSION_KEY), 'session');
  }
  const s = storage({ [PROGRESS_KEY]: previous });
  replaceProgress(emptyProgress(), s, 'next');
  assert.equal(s.getItem(BACKUP_KEY), previous);
  assert.equal(parseProgress(s.getItem(PROGRESS_KEY)).writable, true);
});
test('S1备份直接导入保留累计记录，非法数值与空原文不会被静默重置', () => {
  const raw = JSON.stringify({
    version: 1,
    topics: { topic: { objective: { attempts: 7, correct: 3 } } },
  });
  const result = previewImport(raw, ['topic'], [q]);
  assert.equal(result.legacy, true);
  assert.equal(result.progress.topics.topic.objective.attempts, 7);
  assert.equal(parseProgress('').writable, false);
  const p = emptyProgress();
  p.bookmarks.topic = -1;
  assert.equal(parseProgress(JSON.stringify(p)).writable, false);
});
