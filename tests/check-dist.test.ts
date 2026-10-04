import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error plain JS module
import { findProblems } from '../scripts/check-dist.mjs';

let dir: string;
const page = (body: string, banner = true) =>
  `<html><body>${banner ? '<div data-disclaimer></div>' : ''}${body}</body></html>`;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'dist-'));
  mkdirSync(join(dir, 'img'), { recursive: true });
  writeFileSync(join(dir, 'img', 'a.png'), 'x');
  writeFileSync(join(dir, 'artikel.html'), page('ok'));
});

describe('findProblems', () => {
  it('returns no problems for a clean dist', () => {
    writeFileSync(join(dir, 'index.html'), page('<img src="/img/a.png"><a href="/artikel">x</a>'));
    expect(findProblems(dir)).toEqual([]);
  });
  it('flags a page without the disclaimer banner', () => {
    writeFileSync(join(dir, 'index.html'), page('hi', false));
    expect(findProblems(dir).join('\n')).toContain('disclaimer');
  });
  it('flags a missing image', () => {
    writeFileSync(join(dir, 'index.html'), page('<img src="/img/missing.png">'));
    expect(findProblems(dir).join('\n')).toContain('/img/missing.png');
  });
  it('flags a broken internal link', () => {
    writeFileSync(join(dir, 'index.html'), page('<a href="/nope">x</a>'));
    expect(findProblems(dir).join('\n')).toContain('/nope');
  });
});
