import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_SITE = 'https://abilsudarman.my.id';

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function pageUrl(dist, file) {
  const rel = relative(dist, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
}

function pathExists(dist, pathname) {
  const clean = decodeURIComponent(pathname);
  if (clean === '/' || clean === '') return existsSync(join(dist, 'index.html'));
  const base = join(dist, clean);
  if (existsSync(base) && statSync(base).isFile()) return true;
  return existsSync(join(base, 'index.html')) || existsSync(`${base}.html`);
}

export function findProblems(dist, site = DEFAULT_SITE) {
  const files = htmlFiles(dist);
  if (files.length === 0) return [`${dist}: no HTML pages found`];
  const origin = new URL(site).origin;
  const problems = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const base = new URL(pageUrl(dist, file), origin);
    if (!html.includes('data-disclaimer')) problems.push(`${file}: missing disclaimer banner`);
    const og = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/);
    if (!og) problems.push(`${file}: missing og:image`);
    else {
      let ogUrl;
      try { ogUrl = new URL(og[1], base); } catch { ogUrl = null; }
      if (!ogUrl || (ogUrl.origin === origin && !pathExists(dist, ogUrl.pathname))) problems.push(`${file}: og:image file not found ${og[1]}`);
    }
    if (/<details[^>]*class="nav__menu"/.test(html) && !/<details[^>]*class="nav__menu"[^>]*\sopen/.test(html)) {
      problems.push(`${file}: nav menu is not open by default (breaks without JavaScript)`);
    }
    for (const m of html.matchAll(/(?:src|href)=(?:"([^"]*)"|'([^']*)')/g)) {
      const raw = (m[1] ?? m[2] ?? '').trim();
      if (raw === '' || raw.startsWith('#') || /^(mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
      let url;
      try { url = new URL(raw, base); } catch { continue; }
      if (url.origin !== origin) continue;
      if (!pathExists(dist, url.pathname)) problems.push(`${file}: unresolved reference ${raw}`);
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
