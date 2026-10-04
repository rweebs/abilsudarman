import * as THREE from 'three';
import { makeStars, placeClaimStars } from './layout';
import { makeFlock, stepFlock, birdTarget, DEFAULT_FLOCK } from './flock';
import { CAMERA_POSES, type SkyState } from './states';

export interface SceneClaim { id: string; evidence: number }
export interface SceneInit { canvas: HTMLCanvasElement; claims: SceneClaim[]; reducedMotion: boolean }
export interface AbabilScene {
  setState(s: SkyState): void;
  resize(w: number, h: number): void;
  setPaused(p: boolean): void;
  dispose(): void;
}

const BIRD_COUNT = 96;
const MAX_LINES_PER_CLAIM = 6;

function birdGeometry(phases: Float32Array): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, 0.5, -0.08, 0, -0.3, 0.08, 0, -0.3,
    0, 0, 0.15, -0.7, 0, -0.1, 0, 0, -0.25,
    0, 0, 0.15, 0.7, 0, -0.1, 0, 0, -0.25,
  ]), 3));
  g.setAttribute('phase', new THREE.InstancedBufferAttribute(phases, 1));
  return g;
}

export function createScene({ canvas, claims, reducedMotion }: SceneInit): AbabilScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const small = window.matchMedia('(max-width: 768px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

  // star dome
  const stars = makeStars(900, 7, 60);
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(stars.flatMap((s) => [s.x, s.y, s.z])), 3));
  const starMat = new THREE.PointsMaterial({ size: 0.12, color: 0xcfd8ff, sizeAttenuation: true, transparent: true, opacity: 0.9 });
  scene.add(new THREE.Points(starGeo, starMat));

  // claim stars (one per published butir kawal)
  const placed = placeClaimStars(claims.map((c) => c.id));
  const evidenceById = new Map(claims.map((c) => [c.id, c.evidence]));
  const claimGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const haloGeo = new THREE.SphereGeometry(0.34, 16, 16);
  const claimMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.16 });
  for (const p of placed) {
    const core = new THREE.Mesh(claimGeo, claimMat);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    core.position.set(p.x, p.y, p.z);
    halo.position.set(p.x, p.y, p.z);
    scene.add(core, halo);
  }
  const claimPos = placed.map((p) => ({ x: p.x, y: p.y, z: p.z }));

  // evidence lines
  const lineArr = new Float32Array(Math.max(1, placed.length) * MAX_LINES_PER_CLAIM * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0 });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // ababil flock
  const phases = new Float32Array(BIRD_COUNT).map((_, i) => (i * 0.37) % (Math.PI * 2));
  const birdMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#efe8d6') } },
    vertexShader: `
      attribute float phase;
      uniform float uTime;
      void main() {
        vec3 p = position;
        p.y += abs(p.x) * sin(uTime * 9.0 + phase) * 0.7;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: 'uniform vec3 uColor; void main() { gl_FragColor = vec4(uColor, 1.0); }',
    side: THREE.DoubleSide,
  });
  const birdGeo = birdGeometry(phases);
  const mesh = new THREE.InstancedMesh(birdGeo, birdMat, BIRD_COUNT);
  mesh.frustumCulled = false;
  scene.add(mesh);

  let birds = makeFlock(BIRD_COUNT, 11);
  let state: SkyState = 'circle';
  let time = 0;
  let paused = false;
  let raf = 0;
  let last = performance.now();
  const dummy = new THREE.Object3D();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const tgtPos = new THREE.Vector3();
  const tgtLook = new THREE.Vector3();

  function applyPose(snap: boolean) {
    const pose = CAMERA_POSES[state];
    tgtPos.set(pose.pos.x, pose.pos.y, pose.pos.z);
    tgtLook.set(pose.look.x, pose.look.y, pose.look.z);
    if (snap) { camPos.copy(tgtPos); camLook.copy(tgtLook); }
  }

  function stepBirds(dt: number) {
    const targets = birds.map((_, i) => birdTarget(state, i, time, claimPos));
    birds = stepFlock(birds, targets, DEFAULT_FLOCK, dt);
  }

  function writeBirds() {
    birds.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      if (Math.hypot(b.vx, b.vy, b.vz) > 1e-4) dummy.lookAt(b.x + b.vx, b.y + b.vy, b.z + b.vz);
      dummy.scale.setScalar(0.4);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  function writeLines() {
    let n = 0;
    placed.forEach((c, ci) => {
      const k = Math.min(evidenceById.get(c.id) ?? 0, MAX_LINES_PER_CLAIM);
      for (let j = 0; j < k; j++) {
        const b = birds[(ci + j * placed.length) % birds.length];
        lineArr[n++] = c.x; lineArr[n++] = c.y; lineArr[n++] = c.z;
        lineArr[n++] = b.x; lineArr[n++] = b.y; lineArr[n++] = b.z;
      }
    });
    lineGeo.setDrawRange(0, n / 3);
    lineGeo.attributes.position.needsUpdate = true;
  }

  function render() {
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    birdMat.uniforms.uTime.value = time;
    writeBirds();
    writeLines();
    renderer.render(scene, camera);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused) {
      time += dt;
      stepBirds(dt);
      const k = 1 - Math.exp(-dt * 2.5);
      camPos.lerp(tgtPos, k);
      camLook.lerp(tgtLook, k);
      lineMat.opacity += ((state === 'evidence' ? 0.55 : 0) - lineMat.opacity) * k;
      render();
    }
    raf = requestAnimationFrame(frame);
  }

  function settle() {
    for (let i = 0; i < 120; i++) stepBirds(1 / 30);
    lineMat.opacity = state === 'evidence' ? 0.55 : 0;
    render();
  }

  applyPose(true);
  if (reducedMotion) settle();
  else raf = requestAnimationFrame(frame);

  return {
    setState(s) {
      state = s;
      applyPose(reducedMotion);
      if (reducedMotion) { time += 1; settle(); }
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      if (reducedMotion) render();
    },
    setPaused(p) { paused = p; },
    dispose() {
      cancelAnimationFrame(raf);
      for (const x of [starGeo, claimGeo, haloGeo, lineGeo, birdGeo]) x.dispose();
      for (const m of [starMat, claimMat, haloMat, lineMat, birdMat]) m.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
