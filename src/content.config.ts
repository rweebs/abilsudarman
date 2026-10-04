import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, questionSchema } from './lib/schemas';

export const collections = {
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema: postSchema }),
  questions: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/questions' }), schema: questionSchema }),
};
