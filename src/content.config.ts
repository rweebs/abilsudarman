import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buktiSchema, postSchema } from './lib/schemas';

export const collections = {
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema: postSchema }),
  bukti: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/bukti' }), schema: buktiSchema }),
};
