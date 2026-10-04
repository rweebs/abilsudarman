import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NAV, PAGE_LASTMOD } from '../src/lib/site';

const read = (p: string) => readFileSync(p, 'utf8');

describe('pagespeed wiring', () => {
  it('puts PageSpeed in the nav right after Buku', () => {
    const hrefs = NAV.map((n) => n.href as string);
    expect(hrefs.indexOf('/pagespeed')).toBe(hrefs.indexOf('/buku') + 1);
    expect(NAV.find((n) => n.href === '/pagespeed')?.label).toBe('PageSpeed');
  });
  it('has a YYYY-MM-DD lastmod and a sitemap entry', () => {
    expect((PAGE_LASTMOD as Record<string, string>)['/pagespeed']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(read('src/pages/sitemap.xml.ts')).toContain("path: '/pagespeed'");
  });
  it('states the limits and links the source post', () => {
    const page = read('src/pages/pagespeed.astro');
    expect(page).toContain('Batasan');
    expect(page).toContain('/artikel/meluncurkan-abilsudarman-my-id');
  });
});
