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
  it('rejects a final post without originalUrl', () => {
    const r = postSchema.safeParse({ ...basePost, translationStatus: 'final' });
    expect(r.success).toBe(false);
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
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05', deliveryChannel: 'email' });
    expect(r.success).toBe(true);
  });
  it('rejects dijawab without reply and replyDate', () => {
    const r = questionSchema.safeParse({ ...baseQ, draft: false, sentDate: '2026-10-05',
      deliveryChannel: 'email', status: 'dijawab' });
    expect(r.success).toBe(false);
  });
});
