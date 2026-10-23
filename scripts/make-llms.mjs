import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { siteRoot } from './site-root.mjs';

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function pageFileFor(dist, pathname) {
  const clean = decodeURIComponent(pathname);
  if (clean === '/' || clean === '') return join(dist, 'index.html');
  for (const f of [`${join(dist, clean)}.html`, join(dist, clean, 'index.html')]) if (existsSync(f)) return f;
  return null;
}

const meta = (html, re) => decode((html.match(re) || [])[1] ?? '').trim();

/** Builds llms.txt (https://llmstxt.org) from the pages listed in sitemap.xml, so every indexable page is covered. */
export function buildLlmsTxt(distDir) {
  const dist = siteRoot(distDir);
  const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decode(m[1]));
  const groups = { id: [], en: [] };
  let name = '';
  let summary = '';
  for (const loc of locs) {
    const url = new URL(loc);
    const file = pageFileFor(dist, url.pathname);
    if (!file) continue;
    const html = readFileSync(file, 'utf8');
    const title = meta(html, /<title>([^<]*)<\/title>/);
    const description = meta(html, /<meta name="description" content="([^"]*)"/);
    if (url.pathname === '/') { name = meta(html, /<meta property="og:site_name" content="([^"]*)"/) || title; summary = description; }
    const lang = url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'id';
    groups[lang].push(`- [${title}](${loc})${description ? `: ${description}` : ''}`);
  }
  return [
    `# ${name}`,
    '',
    `> ${summary}`,
    '',
    '## Halaman (Bahasa Indonesia)',
    '',
    ...groups.id,
    '',
    '## Pages (English)',
    '',
    ...groups.en,
    '',
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const dist = siteRoot(resolve(process.argv[2] ?? 'dist'));
  const text = buildLlmsTxt(dist);
  writeFileSync(join(dist, 'llms.txt'), text);
  console.log(`llms.txt: ${text.split('\n').filter((l) => l.startsWith('- [')).length} pages`);
}
