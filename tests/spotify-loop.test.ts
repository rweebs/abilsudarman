import { describe, it, expect } from 'vitest';
import { shouldRestart } from '../src/lib/spotify-loop';

describe('shouldRestart (continuous replay)', () => {
  it('restarts when the track has ended and is paused', () => {
    expect(shouldRestart({ isPaused: true, duration: 30000, position: 30000 })).toBe(true);
  });
  it('restarts when paused within one second of the end', () => {
    expect(shouldRestart({ isPaused: true, duration: 30000, position: 29200 })).toBe(true);
  });
  it('does not restart while playing', () => {
    expect(shouldRestart({ isPaused: false, duration: 30000, position: 29900 })).toBe(false);
  });
  it('does not restart when the listener paused mid-track', () => {
    expect(shouldRestart({ isPaused: true, duration: 30000, position: 12000 })).toBe(false);
  });
  it('does not restart before the duration is known', () => {
    expect(shouldRestart({ isPaused: true, duration: 0, position: 0 })).toBe(false);
  });
  it('treats a position past the duration as ended', () => {
    expect(shouldRestart({ isPaused: true, duration: 30000, position: 31000 })).toBe(true);
  });
});
