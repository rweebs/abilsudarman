import { z } from 'astro/zod';

export const classification = z.enum(['pendapat', 'fakta-dengan-bukti', 'laporan-aduan']);

export const postSchema = z.object({
  title: z.string().min(1),
  originalTitle: z.string().min(1),
  originalUrl: z.string().url().optional(),
  author: z.string().min(1),
  originalDate: z.coerce.date().optional(),
  translationDate: z.coerce.date(),
  classification,
  subjects: z.array(z.string()).default([]),
  translationStatus: z.enum(['draft', 'final']).default('draft'),
  image: z.string().optional(),
});

export type PostData = z.infer<typeof postSchema>;
