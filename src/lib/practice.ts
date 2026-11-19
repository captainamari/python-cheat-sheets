import type { Question } from './schema';
export type Rating = 'again' | 'partial' | 'confident';
export type Answer =
  { kind: 'objective'; correct: boolean; response: string } | { kind: 'self'; rating: Rating };
export type Session = {
  version: 1;
  id?: string;
  generation?: string;
  scope: string;
  questionIds: string[];
  index: number;
  answers: Record<string, Answer>;
  revealed: string[];
  completed: boolean;
};
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createSession(
  questions: Question[],
  scope: string,
  count = 10,
  random = Math.random,
): Session {
  return {
    version: 1,
    id: crypto.randomUUID(),
    scope,
    questionIds: shuffle(questions, random)
      .slice(0, count)
      .map((q) => q.id),
    index: 0,
    answers: {},
    revealed: [],
    completed: false,
  };
}
export const normalizeOutput = (value: string) =>
  value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
export function evaluate(question: Question, response: string): Answer {
  if (question.type === 'mcq')
    return { kind: 'objective', correct: response === question.correct, response };
  if (question.type === 'output')
    return {
      kind: 'objective',
      correct: normalizeOutput(response) === normalizeOutput(question.answer),
      response,
    };
  throw new Error('开放题需要按要点自评');
}
export function answerSession(session: Session, answer: Answer): Session {
  const id = session.questionIds[session.index];
  if (!id || session.completed || session.answers[id]) return session;
  return { ...session, answers: { ...session.answers, [id]: answer } };
}
export function nextQuestion(session: Session): Session {
  if (!session.answers[session.questionIds[session.index]]) return session;
  const next = session.index + 1;
  return {
    ...session,
    index: Math.min(next, session.questionIds.length - 1),
    completed: next >= session.questionIds.length,
  };
}
export function summarize(session: Session) {
  const answers = Object.values(session.answers);
  const objective = answers.filter(
    (a): a is Extract<Answer, { kind: 'objective' }> => a.kind === 'objective',
  );
  return {
    total: answers.length,
    objective: objective.length,
    correct: objective.filter((a) => a.correct).length,
    self: answers.filter((a) => a.kind === 'self').length,
  };
}
export function restoreSession(
  raw: string | null,
  questions: Question[],
  scope: string,
  generation = 'initial',
): Session | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    const byId = new Map(questions.map((q) => [q.id, q]));
    if (
      s.version !== 1 ||
      (s.generation ?? 'initial') !== generation ||
      (s.id !== undefined && (typeof s.id !== 'string' || !s.id.length || s.id.length > 80)) ||
      s.scope !== scope ||
      !Array.isArray(s.questionIds) ||
      !s.questionIds.length ||
      s.questionIds.some((id: unknown) => typeof id !== 'string' || !byId.has(id)) ||
      new Set(s.questionIds).size !== s.questionIds.length
    )
      return null;
    if (
      !Number.isInteger(s.index) ||
      s.index < 0 ||
      s.index >= s.questionIds.length ||
      typeof s.completed !== 'boolean' ||
      !s.answers ||
      typeof s.answers !== 'object' ||
      Array.isArray(s.answers) ||
      !Array.isArray(s.revealed) ||
      s.revealed.some((id: string) => !s.questionIds.includes(id))
    )
      return null;
    for (const [id, value] of Object.entries(s.answers)) {
      const q = byId.get(id);
      const a = value as Answer;
      if (!q || !s.questionIds.includes(id) || !a || typeof a !== 'object') return null;
      if (q.type === 'mcq' || q.type === 'output') {
        if (
          a.kind !== 'objective' ||
          typeof a.response !== 'string' ||
          a.correct !== (evaluate(q, a.response) as { correct: boolean }).correct
        )
          return null;
      } else if (a.kind !== 'self' || !['again', 'partial', 'confident'].includes(a.rating))
        return null;
    }
    if (
      s.questionIds.slice(0, s.index).some((id: string) => !s.answers[id]) ||
      (s.completed && s.questionIds.some((id: string) => !s.answers[id]))
    )
      return null;
    return s as Session;
  } catch {
    return null;
  }
}
