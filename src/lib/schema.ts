import { z } from 'zod';
import { categories, roles } from './catalog';
const id = z.string().regex(/^[a-z][a-z0-9-]+$/);
export const topicSchema = z.object({
  title: z.string().min(8),
  summary: z.string().min(30),
  category: z.enum(categories.map((c) => c.id) as [string, ...string[]]),
  difficulty: z.enum(['basic', 'intermediate', 'advanced']),
  minutes: z.number().int().min(1).max(60),
  order: z.number().int().positive(),
  roles: z.array(z.enum(roles)).min(1),
  python: z.string().min(3),
  example: z.string().regex(/^[a-z_]+\.py$/),
  objectives: z.array(z.string().min(5)).min(2),
  sources: z.array(z.object({ title: z.string(), url: z.url().startsWith('https://') })).min(1),
});
const base = { id, topicId: id, prompt: z.string().min(8), explanation: z.string().min(20) };
const choice = z.object({ id: z.string().regex(/^[a-z]$/), text: z.string().min(1) });
export const questionSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('mcq'),
    choices: z.array(choice).min(2).max(6),
    correct: z.string(),
    code: z.string().optional(),
  }),
  z.object({
    ...base,
    type: z.literal('output'),
    code: z.string().min(10),
    answer: z.string().min(1),
  }),
  z.object({
    ...base,
    type: z.literal('debug'),
    code: z.string().min(10),
    rubric: z.array(z.string()).min(2),
  }),
  z.object({ ...base, type: z.literal('oral'), rubric: z.array(z.string()).min(2) }),
]);
export const questionSetSchema = z.object({
  topicId: id,
  questions: z.array(questionSchema).min(1),
});
export type Question = z.infer<typeof questionSchema>;
export const pathSchema = z.object({
  title: z.string(),
  description: z.string(),
  topics: z.array(id).min(1),
});
