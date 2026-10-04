import { describe, it, expect } from 'vitest';
import { includeDrafts, isPublishedPost, isPublishedQuestion } from '../src/lib/publish';

describe('publish gate', () => {
  it('includeDrafts only when INCLUDE_DRAFTS is "1"', () => {
    expect(includeDrafts({ INCLUDE_DRAFTS: '1' })).toBe(true);
    expect(includeDrafts({ INCLUDE_DRAFTS: 'true' })).toBe(false);
    expect(includeDrafts({})).toBe(false);
  });
  it('hides draft posts in production, shows final', () => {
    expect(isPublishedPost({ translationStatus: 'draft' }, false)).toBe(false);
    expect(isPublishedPost({ translationStatus: 'final' }, false)).toBe(true);
    expect(isPublishedPost({ translationStatus: 'draft' }, true)).toBe(true);
  });
  it('hides draft questions in production', () => {
    expect(isPublishedQuestion({ draft: true }, false)).toBe(false);
    expect(isPublishedQuestion({ draft: false }, false)).toBe(true);
    expect(isPublishedQuestion({ draft: true }, true)).toBe(true);
  });
});
