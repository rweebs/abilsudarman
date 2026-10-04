import { mulberry32 } from './rng';
import type { Vec3 } from './states';

export function makeStars(count: number, seed: number, radius = 40): Vec3[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const u = rnd() * 2 - 1;
    const phi = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    return { x: radius * s * Math.cos(phi), y: radius * u, z: radius * s * Math.sin(phi) };
  });
}

export function placeClaimStars(ids: readonly string[]): Array<Vec3 & { id: string }> {
  const sorted = [...ids].sort();
  const n = sorted.length;
  return sorted.map((id, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = (t - 0.5) * 1.4;
    return { id, x: Math.sin(angle) * 5, y: 2 + Math.cos(i * 1.7) * 0.4, z: -Math.cos(angle) * 5 };
  });
}
