// How much of the battle each device draws. Phones get fewer warriors, arrows and particles, no bloom pass and a lower
// pixel ratio; desktops get the full scene and keep bloom only while the frame rate holds up.
export interface Quality {
  warriorsPerSide: number;
  arrows: number;
  dust: number;
  embers: number;
  terrainSegments: number;
  skirmishPairs: number;
  cavalry: number;
  elephants: number;
  shadowMap: number;
  bloom: boolean;
  shadows: boolean;
  ao: boolean;
  dof: boolean;
  pixelRatio: number;
}

export function qualityFor(mobile: boolean, dpr: number): Quality {
  return mobile
    ? {
      warriorsPerSide: 700, arrows: 48, dust: 140, embers: 90, terrainSegments: 96, skirmishPairs: 28, cavalry: 8, elephants: 2,
      shadowMap: 0, bloom: false, shadows: false, ao: false, dof: false, pixelRatio: Math.min(dpr, 1.25),
    }
    : {
      warriorsPerSide: 1800, arrows: 140, dust: 360, embers: 240, terrainSegments: 200, skirmishPairs: 90, cavalry: 28, elephants: 6,
      shadowMap: 2048, bloom: true, shadows: true, ao: true, dof: true, pixelRatio: Math.min(dpr, 1.5),
    };
}

/** The post-processing and lighting effects that can be switched off when the frame rate falls. */
export interface Effects { ao: boolean; dof: boolean; bloom: boolean; shadows: boolean }

/** Turns off the single most expensive effect still on, in order of cost: ambient occlusion, depth of field, bloom, shadows. */
export function degrade(fx: Effects): Effects {
  if (fx.ao) return { ...fx, ao: false };
  if (fx.dof) return { ...fx, dof: false };
  if (fx.bloom) return { ...fx, bloom: false };
  if (fx.shadows) return { ...fx, shadows: false };
  return { ...fx };
}

export const FPS_FLOOR = 45;
const MIN_SAMPLES = 60;

/** True once enough frames have been timed and their average rate is below the floor. */
export function shouldDropBloom(frameMs: readonly number[], floor = FPS_FLOOR): boolean {
  if (frameMs.length < MIN_SAMPLES) return false;
  const avg = frameMs.reduce((a, b) => a + b, 0) / frameMs.length;
  return 1000 / avg < floor;
}
