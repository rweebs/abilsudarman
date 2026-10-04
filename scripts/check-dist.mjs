import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function resolves(dist, url) {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return existsSync(join(dist, 'index.html'));
  const base = join(dist, clean);
  return existsSync(base) && statSync(base).isFile() ? true
    : existsSync(join(base, 'index.html')) || existsSync(`${base}.html`);
}

export function findProblems(dist) {
  const problems = [];
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-disclaimer')) problems.push(`${file}: missing disclaimer banner`);
    for (const m of html.matchAll(/(?:src|href)="(\/[^"]*)"/g)) {
      const url = m[1];
      if (url.startsWith('//')) continue;
      if (!resolves(dist, url)) problems.push(`${file}: unresolved reference ${url}`);
    }
  }
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const dist = resolve(process.argv[2] ?? 'dist');
  const problems = findProblems(dist);
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  console.log(`dist OK (${htmlFiles(dist).length} pages)`);
}
