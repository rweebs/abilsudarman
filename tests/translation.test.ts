import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/posts';
const EN = new Set('the and of to is that with for was his he this are as by from which not have has had were been be on at it its their they who whom'.split(' '));

function englishRatio(md: string): number {
  const prose = md.replace(/^---[\s\S]*?---/, '').split('\n')
    .filter((l) => !l.startsWith('>') && !l.startsWith('|') && !l.startsWith('![') && !l.startsWith('```'))
    .join(' ').toLowerCase().replace(/[^a-z\s]/g, ' ');
  const words = prose.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  return words.filter((w) => EN.has(w)).length / words.length;
}

describe('translations are Indonesian', () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
  it('has 14 posts', () => expect(files.length).toBe(14));
  for (const f of files) {
    it(`${f} is not left in English`, () => {
      expect(englishRatio(readFileSync(join(DIR, f), 'utf8'))).toBeLessThan(0.06);
    });
  }
});
