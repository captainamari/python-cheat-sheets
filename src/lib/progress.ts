import type { Answer, Rating } from './practice';
export const PROGRESS_KEY = 'python-cheat-sheets:progress:v1';
export const SESSION_KEY = 'python-cheat-sheets:session:v1';
export type TopicProgress = {
  readAt?: number;
  practicedAt?: number;
  objective: { attempts: number; correct: number };
  self?: Rating;
};
export type Progress = { version: 1; topics: Record<string, TopicProgress>; lastTopic?: string };
export const emptyProgress = (): Progress => ({ version: 1, topics: {} });
const safeId = (s: string) => /^[a-z][a-z0-9-]+$/.test(s);
export function parseProgress(raw: string | null): {
  progress: Progress;
  error?: string;
  writable: boolean;
} {
  if (!raw) return { progress: emptyProgress(), writable: true };
  try {
    const p = JSON.parse(raw);
    if (p?.version !== 1)
      return {
        progress: emptyProgress(),
        error: '记录版本无法识别，已保留原数据。',
        writable: false,
      };
    if (!p.topics || typeof p.topics !== 'object' || Array.isArray(p.topics)) throw new Error();
    const topics: Record<string, TopicProgress> = {};
    for (const [id, rawValue] of Object.entries(p.topics)) {
      const v = rawValue as TopicProgress;
      if (
        !safeId(id) ||
        !v ||
        !v.objective ||
        !Number.isSafeInteger(v.objective.attempts) ||
        !Number.isSafeInteger(v.objective.correct) ||
        v.objective.attempts < 0 ||
        v.objective.correct < 0 ||
        v.objective.correct > v.objective.attempts
      )
        throw new Error();
      if (
        [v.readAt, v.practicedAt].some(
          (n) => n !== undefined && (typeof n !== 'number' || !Number.isFinite(n) || n < 0),
        )
      )
        throw new Error();
      if (v.self !== undefined && !['again', 'partial', 'confident'].includes(v.self))
        throw new Error();
      topics[id] = { ...v, objective: { ...v.objective } };
    }
    return {
      progress: {
        version: 1,
        topics,
        ...(typeof p.lastTopic === 'string' && safeId(p.lastTopic)
          ? { lastTopic: p.lastTopic }
          : {}),
      },
      writable: true,
    };
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
export function recordAnswer(p: Progress, id: string, answer: Answer, now = Date.now()): Progress {
  const prev = p.topics[id] ?? blankTopic();
  const topic = { ...prev, practicedAt: now, objective: { ...prev.objective } };
  if (answer.kind === 'objective') {
    topic.objective.attempts++;
    if (answer.correct) topic.objective.correct++;
  } else topic.self = answer.rating;
  return { ...p, lastTopic: id, topics: { ...p.topics, [id]: topic } };
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
export function readProgress(): Progress {
  if (memoryOnly && volatile) return volatile;
  try {
    const result = parseProgress(localStorage.getItem(PROGRESS_KEY));
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
    if (!parseProgress(localStorage.getItem(PROGRESS_KEY)).writable) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    memoryOnly = true;
    notifyStorage('无法保存进度，本次记录暂存在当前页面；刷新后可能丢失。');
  }
}
