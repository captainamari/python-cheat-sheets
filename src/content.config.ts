import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { topicSchema, questionSetSchema, pathSchema } from './lib/schema';
export const collections = {
  topics: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
    schema: topicSchema,
  }),
  questions: defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/questions' }),
    schema: questionSetSchema,
  }),
  paths: defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/paths' }),
    schema: pathSchema,
  }),
};
