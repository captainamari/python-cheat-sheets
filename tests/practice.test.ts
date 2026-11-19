import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSession,
  answerSession,
  nextQuestion,
  evaluate,
  restoreSession,
  summarize,
  shuffle,
} from '../src/lib/practice';
import { parseProgress, emptyProgress, markRead, recordAnswer } from '../src/lib/progress';
import type { Question } from '../src/lib/schema';
const mcq: Question = {
  id: 'topic-choice',
  topicId: 'topic',
  type: 'mcq',
  prompt: '选择正确答案',
  choices: [
    { id: 'a', text: '正确' },
    { id: 'b', text: '错误' },
  ],
  correct: 'a',
  explanation: '解释',
};
const oral: Question = {
  id: 'topic-oral',
  topicId: 'topic',
  type: 'oral',
  prompt: '请组织回答',
  rubric: ['概念', '例子'],
  explanation: '解释',
};
const output: Question = {
  id: 'topic-output',
  topicId: 'topic',
  type: 'output',
  prompt: '写出输出',
  code: 'print(1)',
  answer: '1\n2',
  explanation: '解释',
};

test('组卷不修改题库，数量有上限且没有重复', () => {
  const pool = [mcq, oral, output];
  const original = [...pool];
  const s = createSession(pool, 'all', 10, () => 0);
  assert.deepEqual(pool, original);
  assert.equal(s.questionIds.length, 3);
  assert.equal(new Set(s.questionIds).size, 3);
  assert.deepEqual(
    shuffle([1, 2, 3], () => 0),
    [2, 3, 1],
  );
});
test('输出比较统一换行和末尾空白，同时保留内容差异', () => {
  assert.equal((evaluate(output, '1\r\n2  \n') as { correct: boolean }).correct, true);
  assert.equal((evaluate(output, '1\n3') as { correct: boolean }).correct, false);
});
test('同题只能提交一次，未答题不能前进', () => {
  const s = createSession([mcq], 'topic');
  assert.equal(nextQuestion(s), s);
  const answered = answerSession(s, evaluate(mcq, 'b'));
  assert.equal(answerSession(answered, evaluate(mcq, 'a')), answered);
  assert.equal(nextQuestion(answered).completed, true);
});
test('自评不会混入客观题成绩，练习不会自动标记阅读', () => {
  let s = createSession([mcq, oral], 'topic', 2, () => 0.99);
  s = answerSession(s, evaluate(mcq, 'b'));
  s = nextQuestion(s);
  s = answerSession(s, { kind: 'self', rating: 'confident' });
  s = nextQuestion(s);
  assert.deepEqual(summarize(s), { total: 2, objective: 1, correct: 0, self: 1 });
  let p = recordAnswer(emptyProgress(), 'topic', evaluate(mcq, 'b'), 100);
  p = recordAnswer(p, 'topic', { kind: 'self', rating: 'confident' }, 101);
  assert.equal(p.topics.topic.readAt, undefined);
  assert.deepEqual(p.topics.topic.objective, { attempts: 1, correct: 0 });
  assert.equal(p.topics.topic.self, 'confident');
});
test('刷新恢复已提交答案，非法或过期引用不被接受', () => {
  let s = createSession([mcq, oral], 'topic', 2, () => 0.99);
  s = answerSession(s, evaluate(mcq, 'a'));
  s = nextQuestion(s);
  assert.deepEqual(restoreSession(JSON.stringify(s), [mcq, oral], 'topic'), s);
  assert.equal(restoreSession(JSON.stringify(s), [oral], 'topic'), null);
  assert.equal(restoreSession(JSON.stringify(s), [mcq, oral], 'other'), null);
  const invalid = {
    ...s,
    answers: { [mcq.id]: { kind: 'objective', response: 'b', correct: true } },
  };
  assert.equal(restoreSession(JSON.stringify(invalid), [mcq, oral], 'topic'), null);
});
test('未知版本和损坏数据保留原数据，不覆盖为零进度', () => {
  assert.equal(parseProgress('{').writable, false);
  assert.equal(parseProgress('{"version":2,"topics":{}}').writable, false);
  assert.equal(
    parseProgress('{"version":1,"topics":{"topic":{"objective":{"correct":3,"attempts":1}}}}')
      .writable,
    false,
  );
  assert.equal(parseProgress(null).writable, true);
});
test('阅读标记可独立取消，保留已有练习记录', () => {
  let p = recordAnswer(emptyProgress(), 'topic', evaluate(mcq, 'a'), 100);
  p = markRead(p, 'topic', true, 200);
  p = markRead(p, 'topic', false, 300);
  assert.equal(p.topics.topic.readAt, undefined);
  assert.deepEqual(p.topics.topic.objective, { attempts: 1, correct: 1 });
  assert.equal(p.topics.topic.practicedAt, 100);
  assert.deepEqual(parseProgress(JSON.stringify(p)).progress, p);
});

test('存储写入失败后当前页面使用内存记录，不回退到旧值', async () => {
  const { readProgress, saveProgress } = await import('../src/lib/progress');
  const notice = { hidden: true, textContent: '' };
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw Error('quota');
      },
    },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { getElementById: () => notice },
  });
  try {
    const p = markRead(emptyProgress(), 'quota-topic', true, 123);
    saveProgress(p);
    assert.equal(readProgress().topics['quota-topic'].readAt, 123);
    assert.equal(notice.hidden, false);
    assert.match(notice.textContent, /无法保存进度/);
  } finally {
    if (storageDescriptor) Object.defineProperty(globalThis, 'localStorage', storageDescriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
    if (documentDescriptor) Object.defineProperty(globalThis, 'document', documentDescriptor);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
