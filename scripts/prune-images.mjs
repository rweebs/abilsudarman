import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { siteRoot } from './site-root.mjs';

function textFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'img') out.push(...textFiles(p)); }
    else if (/\.(html|css|js|xml|json)$/.test(name)) out.push(p);
  }
  return out;
}

export function referencedImages(dist) {
  const refs = new Set();
  for (const f of textFiles(dist)) {
    for (const m of readFileSync(f, 'utf8').matchAll(/\/img\/([^"'\s)?#<>]+)/g)) refs.add(decodeURIComponent(m[1]));
  }
  return refs;
}

export function pruneImages(distDir) {
  const dist = siteRoot(distDir);
  const imgDir = join(dist, 'img');
  if (!existsSync(imgDir)) return { kept: 0, removed: 0 };
  const refs = referencedImages(dist);
  let kept = 0;
  let removed = 0;
  for (const name of readdirSync(imgDir)) {
    if (refs.has(name)) kept += 1;
    else { rmSync(join(imgDir, name)); removed += 1; }
  }
  return { kept, removed };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { kept, removed } = pruneImages(resolve(process.argv[2] ?? 'dist'));
  console.log(`images: kept ${kept}, removed ${removed}`);
}
