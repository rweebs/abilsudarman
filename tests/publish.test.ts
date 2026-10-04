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

import { assertEvidencePublished } from '../src/lib/publish';

describe('assertEvidencePublished', () => {
  const posts: Record<string, { translationStatus: string }> = {
    final1: { translationStatus: 'final' },
    draft1: { translationStatus: 'draft' },
  };
  const find = (id: string) => posts[id];

  it('passes when all evidence is final', () => {
    expect(() => assertEvidencePublished('q1', ['final1'], find, false)).not.toThrow();
  });
  it('throws naming the draft post in production', () => {
    expect(() => assertEvidencePublished('q1', ['final1', 'draft1'], find, false)).toThrow(/q1.*draft1/);
  });
  it('throws for a missing post', () => {
    expect(() => assertEvidencePublished('q1', ['nope'], find, false)).toThrow(/q1.*nope/);
  });
  it('allows drafts in preview', () => {
    expect(() => assertEvidencePublished('q1', ['draft1'], find, true)).not.toThrow();
  });
});
