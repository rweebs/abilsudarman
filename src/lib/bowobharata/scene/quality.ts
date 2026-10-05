// How much of the battle each device draws. Phones get fewer warriors, arrows and particles, no bloom pass and a lower
// pixel ratio; desktops get the full scene and keep bloom only while the frame rate holds up.
export interface Quality {
  warriorsPerSide: number;
  arrows: number;
  dust: number;
  embers: number;
  terrainSegments: number;
  bloom: boolean;
  pixelRatio: number;
}

export function qualityFor(mobile: boolean, dpr: number): Quality {
  return mobile
    ? { warriorsPerSide: 700, arrows: 48, dust: 140, embers: 90, terrainSegments: 96, bloom: false, pixelRatio: Math.min(dpr, 1.25) }
    : { warriorsPerSide: 1800, arrows: 140, dust: 360, embers: 240, terrainSegments: 200, bloom: true, pixelRatio: Math.min(dpr, 1.5) };
}

export const FPS_FLOOR = 45;
const MIN_SAMPLES = 60;

/** True once enough frames have been timed and their average rate is below the floor. */
export function shouldDropBloom(frameMs: readonly number[], floor = FPS_FLOOR): boolean {
  if (frameMs.length < MIN_SAMPLES) return false;
  const avg = frameMs.reduce((a, b) => a + b, 0) / frameMs.length;
  return 1000 / avg < floor;
}
