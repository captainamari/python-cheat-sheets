import type { Question } from '../lib/schema';
import {
  createSession,
  answerSession,
  nextQuestion,
  evaluate,
  restoreSession,
  summarize,
  type Session,
  type Answer,
  type Rating,
} from '../lib/practice';
import {
  readProgress,
  saveProgress,
  recordAnswer,
  SESSION_KEY,
  notifyStorage,
  inReview,
  type ReviewMode,
} from '../lib/progress';
import { url } from '../lib/urls';
const { topics, questions } = JSON.parse(
  document.getElementById('practice-data')!.textContent!,
) as { topics: { id: string; title: string }[]; questions: Question[] };
const root = document.getElementById('practice-root')!;
const params = new URLSearchParams(location.search);
const modeLabels = {
  mistakes: '错题复习',
  reinforce: '开放题巩固',
  due: '到期复习',
  bookmarks: '收藏练习',
};
const mode = params.get('mode') as ReviewMode | null;
const single = params.get('question');
const scope = mode
  ? `mode:${mode}`
  : single
    ? `question:${single}`
    : (params.get('topic') ?? 'all');
const topic = topics.find((t) => t.id === scope);
function getPool() {
  const p = readProgress();
  return questions.filter((q) =>
    mode
      ? Object.hasOwn(modeLabels, mode) && inReview(p, q, mode)
      : single
        ? q.id === single
        : scope === 'all' || q.topicId === scope,
  );
}
let pool = getPool();
const byId = new Map(questions.map((q) => [q.id, q]));
const labels = { mcq: '概念选择', output: '代码输出', debug: '排障分析', oral: '面试口述' };
let session: Session | null = null;
const e = (tag: string, text?: string, className?: string) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};
function button(text: string, handler: () => void, style = 'primary') {
  const b = e('button', text, `button ${style}`) as HTMLButtonElement;
  b.type = 'button';
  b.addEventListener('click', handler);
  return b;
}
function save() {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    notifyStorage('无法保存练习，本轮仍可继续；刷新后可能丢失。');
  }
}
try {
  session = restoreSession(
    localStorage.getItem(SESSION_KEY),
    questions,
    scope,
    readProgress().generation,
  );
} catch {
  notifyStorage('浏览器未允许保存练习，刷新后可能丢失。');
}
function link(text: string, path: string) {
  const a = e('a', text, 'text-link') as HTMLAnchorElement;
  a.href = url(path);
  return a;
}
function focusHeading() {
  root.querySelector<HTMLElement>('h1, h2')?.focus();
}
function heading(text: string) {
  const h = e('h1', text);
  h.tabIndex = -1;
  return h;
}
function start() {
  pool = getPool();
  if (!pool.length) {
    session = null;
    return intro();
  }
  session = createSession(pool, scope, scope === 'all' || mode ? 10 : pool.length);
  session.generation = readProgress().generation;
  save();
  renderQuestion();
  focusHeading();
}
function intro() {
  root.replaceChildren();
  root.append(
    e('p', '先想，再看答案', 'eyebrow accent'),
    heading(
      topic
        ? '练习这篇'
        : mode && Object.hasOwn(modeLabels, mode)
          ? modeLabels[mode]
          : '用一组练习，检验理解。',
    ),
  );
  if (!pool.length && (!session || session.completed)) {
    root.append(
      e(
        'p',
        mode
          ? '当前队列为空。完成练习后，符合条件的题目会出现在这里。'
          : '这个知识点不存在或暂无练习。',
        'page-intro',
      ),
      link('返回知识库', ''),
    );
    return;
  }
  root.append(
    e(
      'p',
      topic?.title ?? '每轮随机抽取最多 10 题。选择、代码输出自动判分；排障与口述按要点自评。',
      'page-intro',
    ),
  );
  const modes = e('div', undefined, 'practice-modes');
  for (const [type, label] of Object.entries(labels)) {
    const card = e('div');
    card.append(
      e('strong', label),
      e(
        'p',
        type === 'mcq'
          ? '区分概念与误区'
          : type === 'output'
            ? '推演代码执行过程'
            : type === 'debug'
              ? '定位原因，提出修复'
              : '组织一段完整回答',
      ),
    );
    modes.append(card);
  }
  root.append(modes);
  const actions = e('div', undefined, 'hero-actions');
  if (session && !session.completed) {
    actions.append(
      button(
        `继续上次练习 · ${Object.keys(session.answers).length}/${session.questionIds.length} 已作答`,
        () => {
          renderQuestion();
          focusHeading();
        },
      ),
    );
    if (pool.length) actions.append(button('重新开始本轮', start, 'secondary'));
  } else
    actions.append(
      button(
        `开始 ${scope === 'all' || mode ? Math.min(10, pool.length) : pool.length} 道练习`,
        start,
      ),
    );
  root.append(
    actions,
    e('p', '已提交答案与当前题目自动保存。练习结果不会自动标记为已阅读。', 'muted'),
  );
  if (scope === 'all') {
    const section = e('section', undefined, 'practice-topics');
    section.append(e('h2', '按知识点练习'));
    for (const t of topics) section.append(link(t.title, `practice/?topic=${t.id}`));
    root.append(section);
  } else root.append(link('练习全部知识点', 'practice/'));
}
function submit(answer: Answer, q: Question) {
  if (!session) return;
  const next = answerSession(session, answer);
  if (next === session) return;
  const progress = readProgress();
  if ((session.generation ?? 'initial') !== progress.generation) {
    session = null;
    notifyStorage('学习记录已在其他页面导入，请重新开始练习。');
    pool = getPool();
    return intro();
  }
  session.id ??= crypto.randomUUID();
  next.id = session.id;
  saveProgress(
    recordAnswer(progress, q.topicId, answer, Date.now(), q.id, `${session.id}:${q.id}`),
  );
  session = next;
  save();
  renderQuestion();
  focusHeading();
}
function renderQuestion() {
  if (session?.id) {
    const id = session.questionIds[session.index];
    const saved = readProgress().questions[id];
    if (!session.answers[id] && saved?.lastAttemptId === `${session.id}:${id}`) {
      session = answerSession(session, saved.lastAnswer);
      save();
    }
  }
  if (!session) return intro();
  if (session.completed) return result();
  const q = byId.get(session.questionIds[session.index]);
  if (!q) {
    session = null;
    return intro();
  }
  const answered = session.answers[q.id];
  root.replaceChildren();
  const bar = e('div', undefined, 'practice-topline');
  bar.append(
    e('span', `${session.index + 1} / ${session.questionIds.length}`, 'mono'),
    e('span', labels[q.type], 'pill'),
    link('退出练习', topic ? `topics/${topic.id}/` : ''),
  );
  root.append(bar);
  const progress = e('progress') as HTMLProgressElement;
  progress.max = session.questionIds.length;
  progress.value = Object.keys(session.answers).length;
  progress.setAttribute('aria-label', '本轮已作答题数');
  root.append(progress);
  root.append(
    e('p', topics.find((t) => t.id === q.topicId)?.title, 'question-topic'),
    heading(q.prompt),
  );
  if ('code' in q && q.code) {
    const pre = e('pre', undefined, 'question-code');
    pre.append(e('code', q.code));
    root.append(pre);
  }
  if (q.type === 'mcq') {
    const field = e('fieldset', undefined, 'choices');
    field.append(e('legend', '选择一个答案', 'sr-only'));
    for (const choice of q.choices) {
      const label = e('label', undefined, 'choice');
      const input = e('input') as HTMLInputElement;
      input.type = 'radio';
      input.name = 'choice';
      input.value = choice.id;
      input.disabled = !!answered;
      input.checked = answered?.kind === 'objective' && answered.response === choice.id;
      label.append(
        input,
        e('span', choice.id.toUpperCase(), 'choice-letter'),
        e('span', choice.text),
      );
      if (answered) {
        if (choice.id === q.correct) label.classList.add('correct');
        else if (input.checked) label.classList.add('incorrect');
      }
      field.append(label);
    }
    root.append(field);
    if (!answered) {
      const check = button('提交答案', () => {
        const selected = root.querySelector<HTMLInputElement>('input[name="choice"]:checked');
        if (selected) submit(evaluate(q, selected.value), q);
      });
      check.disabled = true;
      field.addEventListener('change', () => (check.disabled = false));
      root.append(check);
    }
  } else if (q.type === 'output') {
    const label = e('label', '你的输出（逐行填写）', 'input-label');
    label.setAttribute('for', 'output-answer');
    const input = e('textarea', undefined, 'answer-input') as HTMLTextAreaElement;
    input.id = 'output-answer';
    input.rows = 4;
    input.maxLength = 10000;
    input.spellcheck = false;
    input.disabled = !!answered;
    input.value = answered?.kind === 'objective' ? answered.response : '';
    root.append(label, input);
    if (!answered) {
      const check = button('检查输出', () => submit(evaluate(q, input.value), q));
      check.disabled = true;
      input.addEventListener('input', () => (check.disabled = !input.value.trim()));
      root.append(check);
    }
  } else {
    root.append(
      e(
        'p',
        q.type === 'debug'
          ? '先找出问题，再想一个修复与验证方法。'
          : '先用自己的话回答，再对照要点。',
        'muted',
      ),
    );
    const revealed = session.revealed.includes(q.id) || !!answered;
    if (!revealed)
      root.append(
        button('我想好了，查看回答要点', () => {
          session!.revealed.push(q.id);
          save();
          renderQuestion();
          focusHeading();
        }),
      );
    else {
      const rubric = e('section', undefined, 'rubric');
      rubric.append(e('h2', '回答要点'));
      const list = e('ul');
      q.rubric.forEach((point) => list.append(e('li', point)));
      rubric.append(list);
      root.append(rubric);
      if (!answered) {
        root.append(e('p', '这题由你自评，不计入客观题正确率。', 'muted'));
        const ratings = e('div', undefined, 'rating-actions');
        for (const [rating, label] of [
          ['again', '还需复习'],
          ['partial', '能说出部分'],
          ['confident', '能独立说明'],
        ] as [Rating, string][])
          ratings.append(button(label, () => submit({ kind: 'self', rating }, q), 'secondary'));
        root.append(ratings);
      }
    }
  }
  if (answered) {
    const feedback = e(
      'section',
      undefined,
      `feedback ${answered.kind === 'objective' ? (answered.correct ? 'correct' : 'incorrect') : 'self'}`,
    );
    feedback.setAttribute('role', 'status');
    feedback.append(
      e(
        'h2',
        answered.kind === 'objective'
          ? answered.correct
            ? '回答正确'
            : '再看一下这个细节'
          : `已记录自评：${{ again: '还需复习', partial: '能说出部分', confident: '能独立说明' }[answered.rating]}`,
      ),
    );
    if (q.type === 'output') {
      feedback.append(e('strong', '预期输出'));
      const pre = e('pre');
      pre.append(e('code', q.answer));
      feedback.append(pre);
    }
    feedback.append(e('p', q.explanation), link('回到知识点', `topics/${q.topicId}/`));
    root.append(
      feedback,
      button(session.index === session.questionIds.length - 1 ? '查看本轮结果' : '下一题', () => {
        session = nextQuestion(session!);
        save();
        renderQuestion();
        focusHeading();
      }),
    );
  }
}
function result() {
  if (!session) return;
  const summary = summarize(session);
  root.replaceChildren();
  root.append(
    e('p', '一次练习，一点进步', 'eyebrow accent'),
    heading('本轮练习完成'),
    e(
      'p',
      '客观题结果与开放题自评分开记录。你可以回到知识点，重新梳理没说清楚的部分。',
      'page-intro',
    ),
  );
  const stats = e('div', undefined, 'result-stats');
  for (const [value, label] of [
    [`${summary.correct} / ${summary.objective}`, '客观题答对'],
    [String(summary.self), '开放题已自评'],
    [String(summary.total), '本轮已完成'],
  ]) {
    const card = e('div');
    card.append(e('strong', value), e('span', label));
    stats.append(card);
  }
  root.append(stats);
  const list = e('div', undefined, 'result-list');
  for (const id of session.questionIds) {
    const q = byId.get(id)!;
    const answer = session.answers[id];
    const row = e('div');
    row.append(
      link(q.prompt, `topics/${q.topicId}/`),
      e(
        'span',
        answer.kind === 'objective'
          ? answer.correct
            ? '正确'
            : '待复习'
          : { again: '还需复习', partial: '部分掌握', confident: '能独立说明' }[answer.rating],
        'pill',
      ),
    );
    list.append(row);
  }
  root.append(list);
  const actions = e('div', undefined, 'hero-actions');
  actions.append(button('再练一轮', start), link('查看学习记录', 'review/'));
  root.append(actions);
  focusHeading();
}
if (session?.completed) result();
else intro();
