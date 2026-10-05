import * as THREE from 'three';
import { mulberry32 } from '../../sky/rng';
import { groundHeight, type Slot } from '../stage-math';
import { soldierGeometry } from './anatomy';
import { canvasTexture, wavingCloth, type Part, type SceneContext } from './effects';

/** Standard material with a vertex sway and a marching bob, each soldier out of step with the next (aPhase). */
function marchingMaterial(uTime: { value: number }): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.3 });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nattribute float aPhase;')
      .replace('#include <begin_vertex>', `vec3 transformed = vec3(position);
        transformed.x += sin(uTime * 1.6 + aPhase) * 0.05 * position.y;
        transformed.y += max(0.0, sin(uTime * 2.4 + aPhase)) * 0.05;`);
  };
  m.customProgramCacheKey = () => 'marching';
  return m;
}

function emblem(side: 'dharma' | 'adharma'): THREE.CanvasTexture {
  return canvasTexture(128, 96, (g, w, h) => {
    if (side === 'dharma') {
      g.fillStyle = '#1f3c9c'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e2b54a'; g.lineWidth = 5;
      g.beginPath(); g.arc(w / 2, h / 2, 28, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * 28, h / 2 + Math.sin(a) * 28); g.stroke();
      }
      g.fillStyle = '#e2b54a'; g.fillRect(0, h - 8, w, 8);
    } else {
      g.fillStyle = '#6a1018'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#120a0c'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath();
      for (let t = 0; t < 1; t += 0.02) {
        const r = 6 + t * 26;
        const a = t * Math.PI * 4;
        const x = w / 2 + Math.cos(a) * r;
        const y = h / 2 + Math.sin(a) * r * 0.75;
        if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = '#120a0c'; g.beginPath(); g.arc(w / 2 + 30, h / 2 - 4, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c99a3a'; g.fillRect(0, h - 8, w, 8);
    }
  });
}

function army(side: 'dharma' | 'adharma', slots: Slot[], ctx: SceneContext, geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const rnd = mulberry32(side === 'dharma' ? 11 : 23);
  const mesh = new THREE.InstancedMesh(geometry, material, slots.length);
  const phases = new Float32Array(slots.length);
  const d = new THREE.Object3D();
  const base = new THREE.Color(side === 'dharma' ? '#2e4da6' : '#7b1b26');
  const accent = new THREE.Color(side === 'dharma' ? '#c9a045' : '#1b1214');
  const col = new THREE.Color();
  slots.forEach((s, i) => {
    d.position.set(s.x, groundHeight(s.x, s.z), s.z);
    d.rotation.set(0, (side === 'dharma' ? 0 : Math.PI) + (rnd() - 0.5) * 0.35, 0);
    d.scale.setScalar(0.9 + rnd() * 0.2);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
    col.copy(base).lerp(accent, rnd() < (side === 'dharma' ? 0.12 : 0.4) ? 0.8 : rnd() * 0.15).multiplyScalar(0.8 + rnd() * 0.35);
    mesh.setColorAt(i, col);
    phases[i] = s.phase;
  });
  geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
  mesh.instanceMatrix.needsUpdate = true;
  g.add(mesh);

  // A banner over every division (eight files), two rows deep.
  const { geometry: clothGeo, material: clothMat } = wavingCloth(emblem(side), 1.3, 0.9, ctx.uTime);
  const pole = new THREE.CylinderGeometry(0.03, 0.03, 4, 5).translate(0, 2, 0);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 0.8 });
  const sign = side === 'dharma' ? -1 : 1;
  for (let row = 0; row < 2; row++) {
    for (let div = 0; div < 8; div++) {
      const x = sign * (5.5 + row * 6);
      const z = 14 - (div * 8 + 4) * 0.75 - div * 1.6;
      const y = groundHeight(x, z);
      const p = new THREE.Mesh(pole, poleMat);
      p.position.set(x, y, z);
      const cloth = new THREE.Mesh(clothGeo, clothMat);
      cloth.position.set(x, y + 3.5, z);
      cloth.rotation.y = side === 'dharma' ? Math.PI / 2 : -Math.PI / 2;
      g.add(p, cloth);
    }
  }
  return g;
}

/** Both armies drawn up along the field: Pandawa in blue and gold on the left, Kurawa in crimson and black on the right. */
export function createArmies(ctx: SceneContext, dharma: Slot[], adharma: Slot[]): Part {
  const group = new THREE.Group();
  const material = marchingMaterial(ctx.uTime);
  // Each side gets its own geometry copy, because the per-instance phase attribute lives on the geometry.
  group.add(army('dharma', dharma, ctx, soldierGeometry(), material), army('adharma', adharma, ctx, soldierGeometry(), material));
  return { object: group, update() { /* animated in the shader through ctx.uTime */ } };
}
