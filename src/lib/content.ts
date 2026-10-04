import { getCollection } from 'astro:content';
import { includeDrafts, isPublishedPost } from './publish';

const INCLUDE_DRAFTS = includeDrafts(process.env);

export async function getPosts() {
  const posts = await getCollection('posts', (e) => isPublishedPost(e.data, INCLUDE_DRAFTS));
  return posts.sort((a, b) => b.data.translationDate.getTime() - a.data.translationDate.getTime());
}

export async function getBukti() {
  return getCollection('bukti');
}

export async function getBuku() {
  return getCollection('buku');
}

export async function getVideos() {
  return getCollection('videos');
}

export async function getTiktok() {
  return getCollection('tiktok');
}
