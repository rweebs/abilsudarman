import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { NAV, PAGE_LASTMOD } from '../src/lib/site';

describe('bukti wiring', () => {
  it('puts Bukti in the nav right after Artikel', () => {
    const hrefs = NAV.map((n) => n.href as string);
    expect(hrefs.indexOf('/bukti')).toBe(hrefs.indexOf('/artikel') + 1);
    expect(NAV.find((n) => n.href === '/bukti')?.label).toBe('Bukti');
  });
  it('has a YYYY-MM-DD lastmod for the sitemap', () => {
    expect((PAGE_LASTMOD as Record<string, string>)['/bukti']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('shows whole screenshots in thumbnails (contain, capped height) instead of cropping them', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const rule = css.match(/\.bukti-thumb img\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toContain('object-fit: contain');
    expect(rule).toMatch(/max-height:\s*\d+px/);
  });
  it('the page is a real route and lists /bukti in the sitemap source', () => {
    expect(readFileSync('src/pages/bukti.astro', 'utf8')).toContain('groupBukti');
    expect(readFileSync('src/pages/sitemap.xml.ts', 'utf8')).toContain("path: '/bukti'");
  });
});
