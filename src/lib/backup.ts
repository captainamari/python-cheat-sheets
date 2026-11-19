import {
  BACKUP_KEY,
  PROGRESS_KEY,
  SESSION_KEY,
  parseProgress,
  storedRaw,
  type Progress,
} from './progress';
import type { Question } from './schema';
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export function exportProgress(progress: Progress, now = new Date()) {
  return JSON.stringify(
    { app: 'python-cheat-sheets', format: 1, exportedAt: now.toISOString(), progress },
    null,
    2,
  );
}
export function previewImport(raw: string, topicIds: string[], questions: Question[]) {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES)
    throw Error('文件超过 5 MB，请选择学习记录 JSON。');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw Error('JSON 格式无效，尚未修改本地记录。');
  }
  if (data?.app !== undefined) {
    if (data.app !== 'python-cheat-sheets' || data.format !== 1)
      throw Error('备份格式或版本不受支持。');
    data = data.progress;
  }
  const result = parseProgress(JSON.stringify(data) ?? '');
  if (!result.writable) throw Error(result.error);
  const p = result.progress;
  const known = new Set(topicIds);
  const byId = new Map(questions.map((q) => [q.id, q]));
  let skipped = 0;
  for (const id of Object.keys(p.topics))
    if (!known.has(id)) {
      delete p.topics[id];
      skipped++;
    }
  for (const id of Object.keys(p.bookmarks))
    if (!known.has(id)) {
      delete p.bookmarks[id];
      skipped++;
    }
  for (const [id, value] of Object.entries(p.questions)) {
    const q = byId.get(id);
    if (!q || q.topicId !== value.topicId || !known.has(value.topicId)) {
      delete p.questions[id];
      skipped++;
      continue;
    }
    const objective = q.type === 'mcq' || q.type === 'output';
    if (objective !== (value.lastAnswer.kind === 'objective'))
      throw Error(`题目 ${id} 的记录类型不匹配。`);
  }
  if (p.lastTopic && !known.has(p.lastTopic)) delete p.lastTopic;
  return { progress: p, skipped, legacy: data.version === 1 };
}
// Each setItem is atomic. A failed backup or replacement leaves the current snapshot intact.
export function replaceProgress(
  progress: Progress,
  storage: Storage,
  generation: string,
): Progress {
  const next = { ...progress, generation };
  const raw = JSON.stringify(next);
  if (!parseProgress(raw).writable) throw Error('待导入记录无效。');
  const previous = storedRaw(storage);
  if (previous !== null) storage.setItem(BACKUP_KEY, previous);
  storage.setItem(PROGRESS_KEY, raw);
  try {
    storage.removeItem(SESSION_KEY);
  } catch {
    /* generation invalidates old sessions */
  }
  return next;
}
