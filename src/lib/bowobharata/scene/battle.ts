import * as THREE from 'three';
import { mulberry32 } from '../../sky/rng';
import { groundHeight } from '../stage-math';
import { soldierGeometry } from './anatomy';
import { cavalryGeometry, elephantGeometry } from './creatures';
import type { Part, SceneContext } from './effects';
import { cavalryLanes, clashLayout, elephantSlots } from './motion';
import { limbMaterial } from './rig';

interface Placement { x: number; z: number; rotY: number; phase: number; scale?: number; color?: THREE.Color }

/** One instanced mesh from a list of placements; each instance gets its own gait phase (aPhase, 0..1) and optional tint. */
function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, placements: Placement[], rnd: () => number): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geo, mat, placements.length);
  const phases = new Float32Array(placements.length);
  const d = new THREE.Object3D();
  const white = new THREE.Color('#ffffff');
  placements.forEach((p, i) => {
    d.position.set(p.x, groundHeight(p.x, p.z), p.z);
    d.rotation.set(0, p.rotY, 0);
    d.scale.setScalar(p.scale ?? 1);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
    mesh.setColorAt(i, (p.color ?? white).clone().multiplyScalar(0.85 + rnd() * 0.3));
    phases[i] = p.phase;
  });
  geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
  mesh.instanceMatrix.needsUpdate = true;
  // Instances run across the field in the shader, beyond the bounds three.js would compute from their start positions.
  mesh.frustumCulled = false;
  return mesh;
}

const SIDE = {
  dharma: { tint: new THREE.Color('#5d7bd6'), armor: '#b9a46a', cloth: '#2b4bb8', trim: '#e2b54a' },
  adharma: { tint: new THREE.Color('#b8404c'), armor: '#2a2022', cloth: '#7b1b26', trim: '#c99a3a' },
} as const;

/**
 * What turns the two standing lines into a battle: fighters locked together along the clash line, cavalry charging in from
 * both flanks, and war elephants walking on the wings. All of it is animated in the vertex shader from one clock.
 */
export function createBattle(ctx: SceneContext): Part {
  const { quality, uTime } = ctx;
  const rnd = mulberry32(2024);
  const group = new THREE.Group();

  // Skirmishes: each pair faces each other and lunges in turn, with the legs braced.
  const pairs = clashLayout(quality.skirmishPairs, 9);
  const fighters: Placement[] = pairs.flatMap((p) => [
    { x: p.x - p.gap / 2, z: p.z, rotY: 0, phase: p.phase / (Math.PI * 2), color: SIDE.dharma.tint },
    { x: p.x + p.gap / 2, z: p.z, rotY: Math.PI, phase: (p.phase / (Math.PI * 2) + 0.5) % 1, color: SIDE.adharma.tint },
  ]);
  const fight = limbMaterial(uTime, { swing: 0.55, speed: 4.4, phases: [0, 0, Math.PI], bob: 0.03, lunge: 0.28, roughness: 0.7, metalness: 0.25 });
  group.add(instanced(soldierGeometry(), fight, fighters, rnd));

  for (const side of ['dharma', 'adharma'] as const) {
    const s = SIDE[side];
    const facing = side === 'dharma' ? 0 : Math.PI;

    // Cavalry: a four-beat gallop, charging across a run of twelve units and starting over.
    const gallop = limbMaterial(uTime, {
      swing: 0.75, speed: 9, phases: [0, 0, 0.45, 2.3, 2.8, 0], bob: 0.06, travel: { speed: 7, span: 12 },
      vertexColors: true, roughness: 0.7, metalness: 0.15,
    });
    group.add(instanced(cavalryGeometry(s.armor, s.cloth), gallop, cavalryLanes(quality.cavalry, side, 4).map((l) => ({ ...l, rotY: facing })), rnd));

    // War elephants: a slow diagonal walk, a swaying trunk, a howdah in the army's colours.
    const walk = limbMaterial(uTime, {
      swing: 0.28, speed: 1.7, phases: [0, 0, Math.PI, Math.PI, 0, 1.0], bob: 0.04, vertexColors: true, roughness: 0.85, metalness: 0.05,
    });
    group.add(instanced(elephantGeometry(s.cloth, s.trim), walk, elephantSlots(quality.elephants, side).map((l) => ({ ...l, rotY: facing, scale: 1.05 })), rnd));
  }

  return { object: group, update() { /* animated in the shader through ctx.uTime */ } };
}
