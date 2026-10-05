import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { CREDITS, MODELS } from '../src/lib/bowobharata/model-credits';
import { facingAngle, fitScale } from '../src/lib/bowobharata/scene/fit';

const read = (p: string) => readFileSync(p, 'utf8');

describe('model manifest', () => {
  it('lists only files that are in public/models and are compressed small', () => {
    for (const [name, m] of Object.entries(MODELS)) {
      const file = `public${m.url}`;
      expect(existsSync(file), name).toBe(true);
      expect(statSync(file).size, name).toBeLessThan(900 * 1024);
    }
  });
  it('records the author, licence and source page of every model', () => {
    for (const [name, m] of Object.entries(MODELS)) {
      expect(m.author, name).toBe('Quaternius');
      expect(['CC0 1.0', 'CC BY 3.0'], name).toContain(m.license);
      expect(m.source, name).toMatch(/^https:\/\/poly\.pizza\/m\//);
    }
  });
  it('credits every model that requires attribution (CC BY), on the page', () => {
    const page = read('src/pages/bowobharata.astro');
    expect(page).toContain('CREDITS');
    for (const m of Object.values(MODELS)) {
      if (m.license === 'CC BY 3.0') {
        const credit = CREDITS.find((c) => c.source === m.source);
        expect(credit, m.source).toBeDefined();
        expect(credit!.text).toContain('Quaternius');
        expect(credit!.text).toContain('CC BY 3.0');
      }
    }
  });
  it('caches the models for a week, so a returning visitor does not download them again', () => {
    expect(read('public/_headers')).toMatch(/\/models\/\*\n\s+Cache-Control: public, max-age=604800/);
  });
  it('keeps the credits module free of three.js so the page never imports it', () => {
    expect(read('src/lib/bowobharata/model-credits.ts')).not.toMatch(/from 'three/);
  });
});

describe('fitting a model into the scene', () => {
  it('turns a model so tail-to-head points along +x', () => {
    expect(facingAngle({ x: 0, y: 1, z: 0 }, { x: 2, y: 1, z: 0 })).toBeCloseTo(0);
    expect(facingAngle({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 3 })).toBeCloseTo(Math.PI / 2);
    expect(Math.abs(facingAngle({ x: 0, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }))).toBeCloseTo(Math.PI);
  });
  it('ignores height when working out which way a model faces', () => {
    expect(facingAngle({ x: 0, y: 0, z: 0 }, { x: 1, y: 9, z: 0 })).toBeCloseTo(0);
  });
  it('scales a model so its measured size becomes the target size', () => {
    expect(fitScale(0.5, 2)).toBeCloseTo(4);
    expect(fitScale(100, 1.8)).toBeCloseTo(0.018);
  });
  it('never divides by zero for an empty or degenerate model', () => {
    expect(fitScale(0, 2)).toBe(1);
    expect(fitScale(-3, 2)).toBe(1);
    expect(fitScale(Number.NaN, 2)).toBe(1);
  });
});
