import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_EMAILS = new Set(['abil@assai.id', 'rahmat.wibowo21@gmail.com', 'ditjen-pd@kemdikbud.go.id']);
const DIRS = ['src/content/posts', 'src/content/questions'];

function* files() {
  for (const d of DIRS) for (const f of readdirSync(d)) if (f.endsWith('.md')) yield join(d, f);
}

describe('no personal data in content', () => {
  for (const file of files()) {
    const text = readFileSync(file, 'utf8');
    it(`${file}: no phone numbers`, () => {
      expect(text.match(/(\+62|\b0)[\s-]?8\d{2}[\s-]?\d{3,4}[\s-]?\d{3,5}\b/g) ?? []).toEqual([]);
    });
    it(`${file}: no 16-digit ID numbers`, () => {
      expect(text.match(/\b\d{16}\b/g) ?? []).toEqual([]);
    });
    it(`${file}: no unapproved emails`, () => {
      const found = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? []).filter((e) => !ALLOWED_EMAILS.has(e.toLowerCase()));
      expect(found).toEqual([]);
    });
  }
});
