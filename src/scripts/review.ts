import {
  readProgress,
  PROGRESS_KEY,
  LEGACY_PROGRESS_KEY,
  BACKUP_KEY,
  inReview,
  toggleBookmark,
  saveProgress,
  adoptImportedProgress,
  storedRaw,
  parseProgress,
  type ReviewMode,
  type Progress,
} from '../lib/progress';
import { exportProgress, previewImport, replaceProgress, MAX_BACKUP_BYTES } from '../lib/backup';
import type { Question } from '../lib/schema';
import { url } from '../lib/urls';
const { topics, questions } = JSON.parse(document.getElementById('review-data')!.textContent!) as {
  topics: { id: string; title: string }[];
  questions: Question[];
};
const get = (id: string) => document.getElementById(id)!;
const el = (tag: string, text = '', className = '') => {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
};
const link = (text: string, path: string, className = 'text-link') => {
  const a = el('a', text, className) as HTMLAnchorElement;
  a.href = url(path);
  return a;
};
const button = (text: string, action: () => void, className = 'small-button') => {
  const b = el('button', text, className) as HTMLButtonElement;
  b.type = 'button';
  b.onclick = action;
  return b;
};
const labels = {
  history: '学习记录',
  bookmarks: '收藏',
  mistakes: '客观错题',
  reinforce: '开放题巩固',
  due: '到期复习',
};
let mode: keyof typeof labels = 'history';
const description = {
  history: '阅读和累计成绩独立保存。练习完成不会自动标记已阅读。',
  bookmarks: '收藏不会改变阅读状态。可以逐篇阅读，也可以混合练习收藏的内容。',
  mistakes: '最近一次答错的客观题。重新答对后移出此队列，历史成绩继续保留。',
  reinforce: '最近自评为“还需复习”或“能说出部分”的开放题，不计入客观正确率。',
  due: '已经到复习时间的题目。尚未作答的题目不在此列。',
};
function render() {
  const p = readProgress();
  const active = topics.filter((t) => p.topics[t.id]);
  const total = active.reduce(
    (s, t) => {
      const v = p.topics[t.id];
      return {
        read: s.read + (v.readAt !== undefined ? 1 : 0),
        attempts: s.attempts + v.objective.attempts,
        correct: s.correct + v.objective.correct,
      };
    },
    { read: 0, attempts: 0, correct: 0 },
  );
  get('review-summary').replaceChildren(
    ...[
      [`${total.read} / ${topics.length}`, '已阅读知识点'],
      [String(total.attempts), '客观题累计作答'],
      [
        total.attempts ? `${Math.round((total.correct / total.attempts) * 100)}%` : '—',
        '客观题累计正确率',
      ],
    ].map(([value, label]) => {
      const d = el('div');
      d.append(el('strong', value), el('span', label));
      return d;
    }),
  );
  const queues = Object.fromEntries(
    (['mistakes', 'reinforce', 'due'] as ReviewMode[]).map((m) => [
      m,
      questions.filter((q) => inReview(p, q, m)),
    ]),
  );
  const counts = {
    history: active.length,
    bookmarks: topics.filter((t) => p.bookmarks[t.id] !== undefined).length,
    mistakes: queues.mistakes.length,
    reinforce: queues.reinforce.length,
    due: queues.due.length,
  };
  get('review-filters').replaceChildren(
    ...Object.entries(labels).map(([key, label]) => {
      const b = button(`${label} · ${counts[key as keyof typeof counts]}`, () => {
        mode = key as typeof mode;
        render();
      });
      b.setAttribute('aria-pressed', String(mode === key));
      return b;
    }),
  );
  get('review-description').textContent = description[mode];
  get('review-actions').replaceChildren();
  if (mode !== 'history' && counts[mode])
    get('review-actions').append(link('练习这个队列', `practice/?mode=${mode}`, 'button primary'));
  const list = get('review-list');
  list.replaceChildren();
  if (mode === 'history' || mode === 'bookmarks') {
    for (const t of mode === 'history'
      ? active
      : topics.filter((t) => p.bookmarks[t.id] !== undefined)) {
      const v = p.topics[t.id];
      const row = el('div', '', 'review-row');
      const content = el('div');
      content.append(link(t.title, `topics/${t.id}/`));
      content.append(
        el(
          'p',
          [
            v?.readAt !== undefined ? '已阅读' : '未标记阅读',
            v?.objective.attempts
              ? `客观题 ${v.objective.correct}/${v.objective.attempts} 次答对`
              : '尚未作答客观题',
            v?.self
              ? `最近自评：${{ again: '还需复习', partial: '能说出部分', confident: '能独立说明' }[v.self]}`
              : '尚未自评',
          ].join(' · '),
        ),
      );
      const actions = el('div', '', 'action-group');
      actions.append(link('练习', `practice/?topic=${t.id}`, 'small-button'));
      if (mode === 'bookmarks')
        actions.append(
          button('取消收藏', () => {
            saveProgress(toggleBookmark(readProgress(), t.id));
            render();
          }),
        );
      row.append(content, actions);
      list.append(row);
    }
  } else {
    for (const q of queues[mode].sort(
      (a, b) => p.questions[a.id].dueAt - p.questions[b.id].dueAt,
    )) {
      const v = p.questions[q.id];
      const content = el('div');
      content.append(link(q.prompt, `practice/?question=${q.id}`));
      content.append(
        el(
          'p',
          `${topics.find((t) => t.id === q.topicId)?.title} · ${v.lastAnswer.kind === 'objective' ? '客观题' : '开放题自评'} · ${v.dueAt <= Date.now() ? '已到复习时间' : `下次 ${new Date(v.dueAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}`,
        ),
      );
      const row = el('div', '', 'review-row');
      row.append(content, link('重练此题', `practice/?question=${q.id}`, 'small-button'));
      list.append(row);
    }
  }
  if (!list.children.length) {
    const empty = el('div', '', 'empty-state');
    empty.append(
      el('h2', mode === 'history' ? '从一个问题开始' : '这里暂时没有记录'),
      link('浏览知识库', '', 'button secondary'),
    );
    list.append(empty);
  }
  try {
    get('export-previous').hidden = localStorage.getItem(BACKUP_KEY) === null;
  } catch {
    /* storage notice shown by readProgress */
  }
}
function download(text: string, name: string) {
  const href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
get('export-progress').onclick = () => {
  try {
    const raw = storedRaw();
    if (raw !== null && !parseProgress(raw).writable) {
      download(raw, 'python-original-records.json');
      get('backup-status').textContent = '已导出无法解析的原始记录，便于修复；没有用空记录替换它。';
      return;
    }
  } catch {
    /* Export the current in-memory snapshot when storage is unavailable. */
  }
  download(exportProgress(readProgress()), 'python-learning-records.json');
};
get('export-previous').onclick = () => {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (raw !== null) download(raw, 'python-before-import.json');
  } catch {
    get('backup-status').textContent = '浏览器无法读取备份。';
  }
};
let selection = 0;
get('import-progress').addEventListener('change', async (e) => {
  const request = ++selection;
  const file = (e.target as HTMLInputElement).files?.[0];
  const preview = get('import-preview');
  preview.hidden = true;
  preview.replaceChildren();
  get('backup-status').textContent = '';
  if (!file) return;
  try {
    if (file.size > MAX_BACKUP_BYTES) throw Error('文件超过 5 MB，请选择学习记录 JSON。');
    const raw = await file.text();
    if (request !== selection) return;
    const result = previewImport(
      raw,
      topics.map((t) => t.id),
      questions,
    );
    const p = result.progress;
    preview.hidden = false;
    preview.append(
      el('h3', '导入预览'),
      el(
        'p',
        `${Object.keys(p.topics).length} 个知识点记录 · ${Object.keys(p.bookmarks).length} 个收藏 · ${Object.keys(p.questions).length} 道逐题记录。跳过 ${result.skipped} 条未知记录。${result.legacy ? '这是 S1 记录，将保留累计成绩。' : ''}`,
      ),
    );
    preview.append(el('p', '确认后将替换本机学习记录并结束当前练习。请先导出需要保留的记录。'));
    const confirm = button(
      '确认替换本机记录',
      () => {
        try {
          const next: Progress = replaceProgress(p, localStorage, crypto.randomUUID());
          adoptImportedProgress(next);
          selection++;
          preview.hidden = true;
          preview.replaceChildren();
          render();
          get('backup-status').textContent = '导入成功。记录已替换，成绩未累加。';
        } catch {
          get('backup-status').textContent =
            '导入未完成：无法保存备份或新记录，原记录保持不变。请检查浏览器存储空间和权限。';
        }
      },
      'button primary',
    );
    preview.append(
      confirm,
      button('取消', () => {
        selection++;
        preview.hidden = true;
        preview.replaceChildren();
      }),
    );
  } catch (error) {
    if (request === selection)
      get('backup-status').textContent = error instanceof Error ? error.message : '无法读取文件。';
  }
});
render();
window.addEventListener('storage', (e) => {
  if (!e.key || [PROGRESS_KEY, LEGACY_PROGRESS_KEY].includes(e.key)) render();
});
window.addEventListener('focus', render);
