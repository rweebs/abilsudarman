import { getCollection } from 'astro:content';
import { includeDrafts, isPublishedPost, isPublishedQuestion } from './publish';

export const INCLUDE_DRAFTS = includeDrafts(process.env);

export async function getPosts() {
  const posts = await getCollection('posts', (e) => isPublishedPost(e.data, INCLUDE_DRAFTS));
  return posts.sort((a, b) => b.data.translationDate.getTime() - a.data.translationDate.getTime());
}

export async function getQuestions() {
  const qs = await getCollection('questions', (e) => isPublishedQuestion(e.data, INCLUDE_DRAFTS));
  return qs.sort((a, b) => a.id.localeCompare(b.id));
}
