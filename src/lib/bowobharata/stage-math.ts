import { mulberry32 } from '../sky/rng';
import type { Vec3 } from '../sky/states';

export interface Pose { pos: Vec3; look: Vec3 }

// Battlefield layout. The two armies face each other across the line x = 0: Pandawa (dharma) on the left, Kurawa (adharma)
// on the right. Krishna's chariot stands in the open ground between them; Sengkuni's dice pavilion sits on a mound on the
// Kurawa flank.
export const CHARIOT = { x: -1.5, z: 9 } as const;
export const PAVILION = { x: 16, z: 16 } as const;
const FRONT = 4;
/** Soldiers per rank; the soldier at index i stands in rank Math.floor(i / FORMATION_FILES), rank 0 being the front line. */
export const FORMATION_FILES = 64;

// One framed shot per parva; the camera glides between them on scroll.
export const PARVA_POSES: readonly Pose[] = [
  { pos: { x: 24, y: 9, z: 27 }, look: { x: 16, y: 4.5, z: 16 } }, // 1 dice pavilion
  { pos: { x: 3.2, y: 3.0, z: 16 }, look: { x: 2.6, y: 2.0, z: 8 } }, // 2 the envoy's chariot, from the open ground
  { pos: { x: 0, y: 22, z: 38 }, look: { x: 0, y: 0, z: -10 } }, // 3 both armies, wide
  { pos: { x: 1.5, y: 2.4, z: 19 }, look: { x: 0, y: 1.6, z: -25 } }, // 4 down the clash line
  { pos: { x: 1.0, y: 6.0, z: 19 }, look: { x: -2.6, y: 3.2, z: 8.8 } }, // 5 the chariot and its chakra
  { pos: { x: 30, y: 10, z: 6 }, look: { x: 14, y: 3, z: 12 } }, // 6 pavilion from the Kurawa lines
  { pos: { x: 0, y: 46, z: 16 }, look: { x: 0, y: 0, z: -12 } }, // 7 the field from above
  { pos: { x: -13, y: 3.2, z: 20 }, look: { x: 6, y: 4, z: -8 } }, // 8 dawn behind the chariot
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
// Weighted form so t = 0 and t = 1 return the endpoints exactly.
const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) });
const smoothstep = (e0: number, e1: number, x: number) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

/** Camera pose for a 0..1 scroll progress through the parvas. */
export function poseAt(progress: number): Pose {
  const p = clamp01(progress) * (PARVA_POSES.length - 1);
  const i = Math.min(Math.floor(p), PARVA_POSES.length - 2);
  const t = p - i;
  const a = PARVA_POSES[i];
  const b = PARVA_POSES[i + 1];
  return { pos: lerpVec(a.pos, b.pos, t), look: lerpVec(a.look, b.look, t) };
}

/** 0 while the scene is in its "dadu" palette, easing to 1 (dawn, "dharma") over the last quarter of the scroll. */
export function dharmaMix(progress: number): number {
  return smoothstep(0.75, 1, progress);
}

/** Scroll progress through a container: 0 when its top is at the viewport centre, 1 when its bottom is. */
export function scrollProgress(scrollY: number, top: number, height: number, viewportHeight: number): number {
  if (height <= 0) return 0;
  return clamp01((scrollY + viewportHeight / 2 - top) / height);
}

/** Gently rolling plain with a flat-topped mound under the pavilion. */
export function groundHeight(x: number, z: number): number {
  const roll = Math.sin(x * 0.08) * 0.35 + Math.cos(z * 0.07 + 1.3) * 0.3 + Math.sin((x + z) * 0.15) * 0.12;
  const d = Math.hypot(x - PAVILION.x, z - PAVILION.z);
  return roll + 3.2 * (1 - smoothstep(5, 11, d));
}

export interface Slot { x: number; z: number; phase: number }

/** Ranks and files of one army, in divisions of eight files with a gap between them, each soldier slightly out of line. */
export function formation(count: number, side: 'dharma' | 'adharma', seed: number): Slot[] {
  const rnd = mulberry32(seed + (side === 'dharma' ? 0 : 1000));
  const files = FORMATION_FILES;
  const sign = side === 'dharma' ? -1 : 1;
  return Array.from({ length: count }, (_, i) => {
    const rank = Math.floor(i / files);
    const file = i % files;
    const z = 14 - file * 0.75 - Math.floor(file / 8) * 1.6 + (rnd() - 0.5) * 0.35;
    const x = sign * (FRONT + rank * 0.95 + (rnd() - 0.5) * 0.3);
    return { x, z, phase: rnd() * Math.PI * 2 };
  });
}

/** Point along an arrow's flight: straight between the two ends, lifted by a parabola that peaks at `height` halfway. */
export function arrowArc(t: number, from: Vec3, to: Vec3, height: number): Vec3 {
  const p = lerpVec(from, to, t);
  return { x: p.x, y: p.y + 4 * height * t * (1 - t), z: p.z };
}