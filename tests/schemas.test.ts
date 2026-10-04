import { describe, it, expect } from 'vitest';
import { postSchema, questionSchema } from '../src/lib/schemas';

const basePost = {
  title: 'Judul', originalTitle: 'Title', author: 'Rahmat Wibowo',
  translationDate: '2026-10-04', classification: 'pendapat',
};
const baseQ = { title: 'T', question: 'Q?', allegation: 'A', evidence: ['x'] };

describe('postSchema', () => {
  it('accepts a draft without originalUrl', () => {
    expect(postSchema.safeParse(basePost).success).toBe(true);
  });
  it('accepts a final post without originalUrl (the notice says the link will be added)', () => {
    const r = postSchema.safeParse({ ...basePost, translationStatus: 'final' });
    expect(r.success).toBe(true);
  });
  it('accepts a final post with originalUrl', () => {
    const r = postSchema.safeParse({ ...basePost, translationStatus: 'final', originalUrl: 'https://example.com/a' });
    expect(r.success).toBe(true);
  });
  it('rejects an unknown classification', () => {
    expect(postSchema.safeParse({ ...basePost, classification: 'fakta' }).success).toBe(false);
  });
});

describe('questionSchema', () => {
  it('defaults to draft and belum-dijawab', () => {
    const r = questionSchema.parse(baseQ);
    expect(r.draft).toBe(true);
    expect(r.status).toBe('belum-dijawab');
  });
  it('rejects a published question without sentDate', () => {
    expect(questionSchema.safeParse({ ...baseQ, draft: false }).success).toBe(false);
  });
  it('accepts a published question with sentDate and channel', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05', deliveryChannel: ['email'] });
    expect(r.success).toBe(true);
  });
  it('rejects dijawab without reply and replyDate', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05',
      deliveryChannel: ['email'], status: 'dijawab' });
    expect(r.success).toBe(false);
  });
  it('rejects an empty deliveryChannel array when published', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05', deliveryChannel: [] });
    expect(r.success).toBe(false);
  });
  it('accepts both channels', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05', deliveryChannel: ['email', 'surat'] });
    expect(r.success).toBe(true);
  });
  it('rejects a whitespace-only reply', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05',
      deliveryChannel: ['email'], status: 'dijawab', reply: '   ', replyDate: '2026-10-06' });
    expect(r.success).toBe(false);
  });
  it('rejects replyDate before sentDate', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05',
      deliveryChannel: ['email'], status: 'dijawab', reply: 'Jawaban', replyDate: '2026-10-01' });
    expect(r.success).toBe(false);
  });
  it('accepts a valid answered question with lastCheckedDate', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05',
      deliveryChannel: ['email'], status: 'dijawab', reply: 'Jawaban', replyDate: '2026-10-06', lastCheckedDate: '2026-10-07' });
    expect(r.success).toBe(true);
  });
});
