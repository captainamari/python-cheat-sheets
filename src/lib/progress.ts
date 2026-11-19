import type { Answer, Rating } from './practice';
export const PROGRESS_KEY = 'python-cheat-sheets:progress:v2';
export const LEGACY_PROGRESS_KEY = 'python-cheat-sheets:progress:v1';
export const BACKUP_KEY = 'python-cheat-sheets:before-import';
export const SESSION_KEY = 'python-cheat-sheets:session:v1';
export type TopicProgress = {
  readAt?: number;
  practicedAt?: number;
  objective: { attempts: number; correct: number };
  self?: Rating;
};
export type QuestionProgress = {
  topicId: string;
  attempts: number;
  correct: number;
  lastAnswer: Answer;
  lastAt: number;
  dueAt: number;
  streak: number;
  lastAttemptId: string;
};
export type Progress = {
  version: 2;
  generation: string;
  topics: Record<string, TopicProgress>;
  bookmarks: Record<string, number>;
  questions: Record<string, QuestionProgress>;
  lastTopic?: string;
};
export const emptyProgress = (): Progress => ({
  version: 2,
  generation: 'initial',
  topics: {},
  bookmarks: {},
  questions: {},
});
const safeId = (s: string) => /^[a-z][a-z0-9-]+$/.test(s) && s !== 'constructor';
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const time = (v: unknown): v is number =>
  Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) <= 8640000000000000;
const count = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0;
const rating = (v: unknown): v is Rating => ['again', 'partial', 'confident'].includes(v as string);
const token = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 160;
export function parseProgress(raw: string | null): {
  progress: Progress;
  error?: string;
  writable: boolean;
} {
  if (raw === null) return { progress: emptyProgress(), writable: true };
  try {
    const p = JSON.parse(raw);
    if (p?.version !== 1 && p?.version !== 2)
      return {
        progress: emptyProgress(),
        error: '记录版本无法识别，已保留原数据。',
        writable: false,
      };
    if (!object(p.topics)) throw new Error();
    const result = emptyProgress();
    for (const [id, rawValue] of Object.entries(p.topics)) {
      const v = rawValue as TopicProgress;
      if (
        !safeId(id) ||
        !object(v) ||
        !object(v.objective) ||
        !count(v.objective.attempts) ||
        !count(v.objective.correct) ||
        v.objective.correct > v.objective.attempts ||
        [v.readAt, v.practicedAt].some((n) => n !== undefined && !time(n)) ||
        (v.self !== undefined && !rating(v.self))
      )
        throw new Error();
      result.topics[id] = {
        objective: { attempts: v.objective.attempts, correct: v.objective.correct },
        ...(v.readAt !== undefined ? { readAt: v.readAt } : {}),
        ...(v.practicedAt !== undefined ? { practicedAt: v.practicedAt } : {}),
        ...(v.self !== undefined ? { self: v.self } : {}),
      };
    }
    if (p.lastTopic !== undefined) {
      if (typeof p.lastTopic !== 'string' || !safeId(p.lastTopic)) throw new Error();
      result.lastTopic = p.lastTopic;
    }
    if (p.version === 2) {
      if (!token(p.generation) || !object(p.bookmarks) || !object(p.questions)) throw new Error();
      result.generation = p.generation;
      for (const [id, stamp] of Object.entries(p.bookmarks)) {
        if (!safeId(id) || !time(stamp)) throw new Error();
        result.bookmarks[id] = stamp;
      }
      for (const [id, value] of Object.entries(p.questions)) {
        const v = value as QuestionProgress;
        if (
          !safeId(id) ||
          !object(v) ||
          typeof v.topicId !== 'string' ||
          !safeId(v.topicId) ||
          !count(v.attempts) ||
          !v.attempts ||
          !count(v.correct) ||
          v.correct > v.attempts ||
          !time(v.lastAt) ||
          !time(v.dueAt) ||
          !count(v.streak) ||
          v.streak > v.attempts ||
          !token(v.lastAttemptId) ||
          !object(v.lastAnswer)
        )
          throw new Error();
        const a = v.lastAnswer;
        if (a.kind === 'objective') {
          if (
            typeof a.correct !== 'boolean' ||
            typeof a.response !== 'string' ||
            a.response.length > 100000
          )
            throw new Error();
        } else if (a.kind !== 'self' || !rating(a.rating)) throw new Error();
        result.questions[id] = {
          topicId: v.topicId,
          attempts: v.attempts,
          correct: v.correct,
          lastAt: v.lastAt,
          dueAt: v.dueAt,
          streak: v.streak,
          lastAttemptId: v.lastAttemptId,
          lastAnswer:
            a.kind === 'objective'
              ? { kind: 'objective', correct: a.correct, response: a.response }
              : { kind: 'self', rating: a.rating },
        };
      }
    }
    return { progress: result, writable: true };
  } catch {
    return {
      progress: emptyProgress(),
      error: '本地记录格式损坏，已保留原数据；本次记录暂存在当前页面。',
      writable: false,
    };
  }
}
const blankTopic = (): TopicProgress => ({ objective: { attempts: 0, correct: 0 } });
export function markRead(p: Progress, id: string, read: boolean, now = Date.now()): Progress {
  const topic = { ...(p.topics[id] ?? blankTopic()) };
  if (read) topic.readAt = now;
  else delete topic.readAt;
  return { ...p, lastTopic: id, topics: { ...p.topics, [id]: topic } };
}
export function toggleBookmark(p: Progress, id: string, now = Date.now()): Progress {
  const bookmarks = { ...p.bookmarks };
  if (bookmarks[id] !== undefined) delete bookmarks[id];
  else bookmarks[id] = now;
  return { ...p, bookmarks };
}
export function recordAnswer(
  p: Progress,
  id: string,
  answer: Answer,
  now = Date.now(),
  questionId?: string,
  attemptId?: string,
): Progress {
  if (questionId && attemptId && p.questions[questionId]?.lastAttemptId === attemptId) return p;
  const prev = p.topics[id] ?? blankTopic();
  const topic = { ...prev, practicedAt: now, objective: { ...prev.objective } };
  if (answer.kind === 'objective') {
    topic.objective.attempts++;
    if (answer.correct) topic.objective.correct++;
  } else topic.self = answer.rating;
  const result = { ...p, lastTopic: id, topics: { ...p.topics, [id]: topic } };
  if (questionId && attemptId) {
    const old = p.questions[questionId];
    const good = answer.kind === 'objective' ? answer.correct : answer.rating === 'confident';
    const partial = answer.kind === 'self' && answer.rating === 'partial';
    const streak = good ? (old?.streak ?? 0) + 1 : 0;
    const days = good ? [1, 3, 7, 14][Math.min(streak - 1, 3)] : partial ? 1 : 0;
    result.questions = {
      ...p.questions,
      [questionId]: {
        topicId: id,
        attempts: (old?.attempts ?? 0) + 1,
        correct: (old?.correct ?? 0) + (answer.kind === 'objective' && answer.correct ? 1 : 0),
        lastAnswer: answer,
        lastAt: now,
        dueAt: now + days * 86400000,
        streak,
        lastAttemptId: attemptId,
      },
    };
  }
  return result;
}
export type ReviewMode = 'mistakes' | 'reinforce' | 'due' | 'bookmarks';
export function inReview(
  p: Progress,
  q: { id: string; topicId: string },
  mode: ReviewMode,
  now = Date.now(),
) {
  if (mode === 'bookmarks') return p.bookmarks[q.topicId] !== undefined;
  const v = p.questions[q.id];
  if (!v) return false;
  if (mode === 'due') return v.dueAt <= now;
  if (mode === 'mistakes') return v.lastAnswer.kind === 'objective' && !v.lastAnswer.correct;
  return v.lastAnswer.kind === 'self' && v.lastAnswer.rating !== 'confident';
}
let volatile: Progress | undefined;
let memoryOnly = false;
export function notifyStorage(message: string) {
  const el = document.getElementById('storage-notice');
  if (el) {
    el.hidden = false;
    el.textContent = message;
  }
}
export function storedRaw(storage: Pick<Storage, 'getItem'> = localStorage): string | null {
  return storage.getItem(PROGRESS_KEY) ?? storage.getItem(LEGACY_PROGRESS_KEY);
}
export function readProgress(): Progress {
  if (memoryOnly && volatile) return volatile;
  try {
    const result = parseProgress(storedRaw());
    if (result.error) notifyStorage(result.error);
    return result.writable ? result.progress : (volatile ?? result.progress);
  } catch {
    memoryOnly = true;
    notifyStorage('浏览器未允许保存进度，本次记录暂存在当前页面。');
    return volatile ?? emptyProgress();
  }
}
export function saveProgress(progress: Progress): void {
  volatile = progress;
  try {
    if (!parseProgress(storedRaw()).writable) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    memoryOnly = false;
  } catch {
    memoryOnly = true;
    notifyStorage('无法保存进度，本次记录暂存在当前页面；刷新后可能丢失。');
  }
}
export function adoptImportedProgress(p: Progress) {
  volatile = p;
  memoryOnly = false;
}
