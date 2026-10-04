import { describe, it, expect } from 'vitest';
import { mulberry32 } from '../src/lib/sky/rng';
import { stateForSection, SECTION_STATE, CAMERA_POSES, homeSections, poseStateFor } from '../src/lib/sky/states';
import { makeStars, placeClaimStars } from '../src/lib/sky/layout';
import { makeFlock, stepFlock, birdTarget, DEFAULT_FLOCK } from '../src/lib/sky/flock';

describe('mulberry32', () => {
  it('is deterministic and in [0,1)', () => {
    const a = mulberry32(5); const b = mulberry32(5);
    for (let i = 0; i < 50; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('states', () => {
  it('maps every home section to a state', () => {
    expect(stateForSection('operasi')).toBe('circle');
    expect(stateForSection('siapa')).toBe('circle');
    expect(stateForSection('klaim')).toBe('claims');
    expect(stateForSection('bukti')).toBe('evidence');
    expect(stateForSection('jawaban')).toBe('status');
  });
  it('falls back to circle for an unknown section', () => {
    expect(stateForSection('???')).toBe('circle');
  });
  it('has a camera pose for every state used', () => {
    for (const s of new Set(Object.values(SECTION_STATE))) expect(CAMERA_POSES[s]).toBeDefined();
  });
});

describe('home sections without claims', () => {
  it('lists all five sections when there are claims', () => {
    expect(homeSections(true)).toEqual(['operasi', 'siapa', 'klaim', 'bukti', 'jawaban']);
  });
  it('drops the empty Kawal section when there are no claims', () => {
    expect(homeSections(false)).toEqual(['operasi', 'siapa', 'bukti', 'jawaban']);
  });
  it('keeps the wide camera pose for claims/evidence when there are no claim-stars', () => {
    expect(poseStateFor('claims', false)).toBe('circle');
    expect(poseStateFor('evidence', false)).toBe('circle');
    expect(poseStateFor('status', false)).toBe('status');
  });
  it('uses the state itself when claim-stars exist', () => {
    expect(poseStateFor('claims', true)).toBe('claims');
    expect(poseStateFor('evidence', true)).toBe('evidence');
  });
});

describe('layout', () => {
  it('makes a deterministic star dome of the requested size', () => {
    const a = makeStars(100, 7, 40); const b = makeStars(100, 7, 40);
    expect(a).toHaveLength(100);
    expect(a).toEqual(b);
    for (const s of a) expect(Math.hypot(s.x, s.y, s.z)).toBeCloseTo(40, 5);
  });
  it('places exactly one claim star per id, sorted by id, deterministically', () => {
    const p = placeClaimStars(['b', 'a', 'c']);
    expect(p.map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(placeClaimStars(['b', 'a', 'c'])).toEqual(p);
  });
  it('handles zero and one claim', () => {
    expect(placeClaimStars([])).toEqual([]);
    expect(placeClaimStars(['x'])).toHaveLength(1);
  });
});

describe('flock', () => {
  const target = { x: 10, y: 2, z: 0 };
  const targetsFor = (n: number) => Array.from({ length: n }, () => target);

  it('makes the requested number of birds deterministically', () => {
    expect(makeFlock(30, 1)).toHaveLength(30);
    expect(makeFlock(30, 1)).toEqual(makeFlock(30, 1));
  });
  it('does not mutate its input and keeps the count', () => {
    const birds = makeFlock(20, 2);
    const copy = JSON.parse(JSON.stringify(birds));
    const next = stepFlock(birds, targetsFor(20), DEFAULT_FLOCK, 0.016);
    expect(birds).toEqual(copy);
    expect(next).toHaveLength(20);
  });
  it('never exceeds max speed', () => {
    let birds = makeFlock(40, 3);
    for (let i = 0; i < 200; i++) birds = stepFlock(birds, targetsFor(40), DEFAULT_FLOCK, 0.016);
    for (const b of birds) expect(Math.hypot(b.vx, b.vy, b.vz)).toBeLessThanOrEqual(DEFAULT_FLOCK.maxSpeed + 1e-6);
  });
  it('moves the flock toward its target', () => {
    let birds = makeFlock(40, 4);
    const dist = (bs: typeof birds) => bs.reduce((s, b) => s + Math.hypot(b.x - target.x, b.y - target.y, b.z - target.z), 0) / bs.length;
    const before = dist(birds);
    for (let i = 0; i < 300; i++) birds = stepFlock(birds, targetsFor(40), DEFAULT_FLOCK, 0.016);
    expect(dist(birds)).toBeLessThan(before);
  });
  it('stays finite over a long run', () => {
    let birds = makeFlock(40, 5);
    for (let i = 0; i < 1000; i++) birds = stepFlock(birds, targetsFor(40), DEFAULT_FLOCK, 0.016);
    for (const b of birds) for (const v of [b.x, b.y, b.z, b.vx, b.vy, b.vz]) expect(Number.isFinite(v)).toBe(true);
  });
});

describe('birdTarget', () => {
  const claims = [{ x: -2, y: 2, z: -5 }, { x: 2, y: 2, z: -5 }];
  it('returns finite targets for every state with and without claims', () => {
    for (const s of ['circle', 'claims', 'evidence', 'status'] as const) {
      for (const cl of [claims, []]) {
        const t = birdTarget(s, 3, 1.5, cl);
        expect(Number.isFinite(t.x) && Number.isFinite(t.y) && Number.isFinite(t.z)).toBe(true);
      }
    }
  });
  it('sends birds to their assigned claim in the evidence state', () => {
    expect(birdTarget('evidence', 0, 0, claims)).toEqual(claims[0]);
    expect(birdTarget('evidence', 1, 0, claims)).toEqual(claims[1]);
  });
});
