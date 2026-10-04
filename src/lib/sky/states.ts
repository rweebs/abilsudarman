export interface Vec3 { x: number; y: number; z: number }
export type SkyState = 'circle' | 'status';

export const HOME_SECTIONS = ['operasi', 'siapa', 'bukti', 'jawaban'] as const;

export const SECTION_STATE: Record<string, SkyState> = {
  operasi: 'circle',
  siapa: 'circle',
  bukti: 'circle',
  jawaban: 'status',
};

export function stateForSection(id: string): SkyState {
  return SECTION_STATE[id] ?? 'circle';
}

export const CAMERA_POSES: Record<SkyState, { pos: Vec3; look: Vec3 }> = {
  circle: { pos: { x: 0, y: 1.2, z: 11 }, look: { x: 0, y: 1.5, z: 0 } },
  status: { pos: { x: 0, y: 3, z: 8 }, look: { x: 0, y: 3, z: -4 } },
};
