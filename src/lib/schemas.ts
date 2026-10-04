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

export const questionSchema = z
  .object({
    title: z.string().min(1),
    question: z.string().min(1),
    allegation: z.string().min(1),
    evidence: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
    status: z.enum(['belum-dijawab', 'dijawab']).default('belum-dijawab'),
    sentDate: z.coerce.date().optional(),
    deliveryChannel: z.array(z.enum(['email', 'surat'])).optional(),
    reply: z.string().trim().min(1).optional(),
    replyDate: z.coerce.date().optional(),
    lastCheckedDate: z.coerce.date().optional(),
  })
  .superRefine((q, ctx) => {
    if (!q.draft && (!q.sentDate || !q.deliveryChannel || q.deliveryChannel.length === 0)) {
      ctx.addIssue({ code: 'custom', path: ['sentDate'], message: 'Butir kawal terbit wajib punya sentDate dan deliveryChannel' });
    }
    if (q.status === 'dijawab' && (!q.reply || !q.replyDate)) {
      ctx.addIssue({ code: 'custom', path: ['reply'], message: 'Status dijawab wajib punya reply dan replyDate' });
    }
    if (q.sentDate && q.replyDate && q.replyDate < q.sentDate) {
      ctx.addIssue({ code: 'custom', path: ['replyDate'], message: 'replyDate tidak boleh sebelum sentDate' });
    }
  });

export type PostData = z.infer<typeof postSchema>;
export type QuestionData = z.infer<typeof questionSchema>;
