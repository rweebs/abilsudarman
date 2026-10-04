import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { bukuSchema, buktiSchema, postSchema, videoSchema } from './lib/schemas';

export const collections = {
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema: postSchema }),
  bukti: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/bukti' }), schema: buktiSchema }),
  buku: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/buku' }), schema: bukuSchema }),
  videos: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/videos' }), schema: videoSchema }),
};
