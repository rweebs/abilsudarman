import { describe, it, expect } from 'vitest';
import { PARVA_POSES, dharmaMix, poseAt, scrollProgress } from '../src/lib/bowobharata/stage-math';

describe('camera path', () => {
  it('has one pose per parva', () => expect(PARVA_POSES).toHaveLength(8));
  it('starts at the first pose and ends at the last, and clamps outside 0..1', () => {
    expect(poseAt(0)).toEqual(PARVA_POSES[0]);
    expect(poseAt(1)).toEqual(PARVA_POSES[7]);
    expect(poseAt(-3)).toEqual(PARVA_POSES[0]);
    expect(poseAt(9)).toEqual(PARVA_POSES[7]);
  });
  it('glides linearly between neighbouring poses', () => {
    const mid = poseAt(0.5 / 7);
    expect(mid.pos.x).toBeCloseTo((PARVA_POSES[0].pos.x + PARVA_POSES[1].pos.x) / 2);
    expect(mid.look.z).toBeCloseTo((PARVA_POSES[0].look.z + PARVA_POSES[1].look.z) / 2);
  });
});

describe('dharma palette mix', () => {
  it('stays dark until three quarters of the way, then rises smoothly to full light', () => {
    expect(dharmaMix(0)).toBe(0);
    expect(dharmaMix(0.75)).toBe(0);
    expect(dharmaMix(1)).toBe(1);
    expect(dharmaMix(0.875)).toBeGreaterThan(0);
    expect(dharmaMix(0.875)).toBeLessThan(1);
    expect(dharmaMix(0.95)).toBeGreaterThan(dharmaMix(0.9));
  });
});

describe('scroll progress', () => {
  it('is 0 before the parvas, 1 after them, and proportional in between', () => {
    expect(scrollProgress(0, 1000, 2000, 800)).toBe(0);
    expect(scrollProgress(5000, 1000, 2000, 800)).toBe(1);
    expect(scrollProgress(1600, 1000, 2000, 800)).toBeCloseTo(0.5);
  });
  it('is 0 for an empty container instead of dividing by zero', () => {
    expect(scrollProgress(100, 0, 0, 800)).toBe(0);
  });
});
