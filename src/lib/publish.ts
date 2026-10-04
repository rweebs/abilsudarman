export const includeDrafts = (env: Record<string, string | undefined>): boolean => env.INCLUDE_DRAFTS === '1';
export const isPublishedPost = (d: { translationStatus: string }, inc: boolean): boolean =>
  inc || d.translationStatus === 'final';
export const isPublishedQuestion = (d: { draft: boolean }, inc: boolean): boolean => inc || !d.draft;

export function assertEvidencePublished(
  questionId: string,
  evidenceIds: readonly string[],
  find: (id: string) => { translationStatus: string } | undefined,
  inc: boolean,
): void {
  for (const id of evidenceIds) {
    const post = find(id);
    if (!post) throw new Error(`Butir kawal ${questionId} merujuk artikel yang tidak ada: ${id}`);
    if (!isPublishedPost(post, inc)) throw new Error(`Butir kawal ${questionId} merujuk artikel yang belum terbit: ${id}`);
  }
}
