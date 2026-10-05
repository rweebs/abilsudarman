import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { dharmaMix, formation, groundHeight, poseAt } from './stage-math';
import { qualityFor, shouldDropBloom } from './scene/quality';
import { createBattleEffects, createContext, type Part } from './scene/effects';
import { createEnvironment } from './scene/environment';
import { createArmies } from './scene/army';
import { createChariot } from './scene/chariot';
import { createPavilion } from './scene/pavilion';

export interface SceneInit { canvas: HTMLCanvasElement; reducedMotion: boolean; mobile: boolean; onLost?: () => void }
export interface KurukshetraScene {
  setProgress(p: number): void;
  resize(w: number, h: number): void;
  setPaused(p: boolean): void;
  dispose(): void;
}

// Under reduced motion the battle is shown as a still: arrows mid-flight, flags caught mid-wave.
const STILL_TIME = 3.2;

export function createScene({ canvas, reducedMotion, mobile, onLost }: SceneInit): KurukshetraScene {
  const quality = qualityFor(mobile, window.devicePixelRatio || 1);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: mobile ? 'low-power' : 'high-performance' });
  renderer.setPixelRatio(quality.pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  const ctx = createContext(quality);
  const dharma = formation(quality.warriorsPerSide, 'dharma', 5);
  const adharma = formation(quality.warriorsPerSide, 'adharma', 5);
  const parts: Part[] = [
    createEnvironment(scene, camera, ctx),
    createArmies(ctx, dharma, adharma),
    createChariot(ctx),
    createPavilion(ctx),
    createBattleEffects(ctx, dharma, adharma, groundHeight),
  ];
  for (const p of parts) scene.add(p.object);

  let composer: EffectComposer | undefined;
  if (quality.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.55, 0.82));
    composer.addPass(new OutputPass());
  }
  const frameMs: number[] = [];

  let progress = 0;
  let target = 0;
  let time = reducedMotion ? STILL_TIME : 0;
  let paused = false;
  let raf = 0;
  let last = 0;

  const draw = () => {
    const { pos, look } = poseAt(progress);
    const drift = reducedMotion ? 0 : 1;
    camera.position.set(pos.x + Math.sin(time * 0.13) * 0.35 * drift, pos.y + Math.sin(time * 0.21) * 0.15 * drift, pos.z);
    camera.lookAt(look.x, look.y, look.z);
    const mix = dharmaMix(progress);
    ctx.uTime.value = time;
    for (const p of parts) p.update(time, mix);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const frame = (now: number) => {
    raf = 0;
    if (paused) return;
    const ms = now - last;
    const dt = Math.min(ms / 1000 || 0, 0.05);
    last = now;
    time += dt;
    progress += (target - progress) * Math.min(1, dt * 3);
    if (composer && ms > 0) {
      frameMs.push(ms);
      if (frameMs.length > 120) frameMs.shift();
      if (shouldDropBloom(frameMs)) { composer.dispose(); composer = undefined; }
    }
    draw();
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && !paused) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  const onContextLost = (e: Event) => { e.preventDefault(); stop(); onLost?.(); };
  canvas.addEventListener('webglcontextlost', onContextLost);

  draw();
  if (!reducedMotion) start();

  return {
    setProgress(p) {
      target = Math.min(1, Math.max(0, p));
      if (reducedMotion) { progress = target; draw(); }
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      draw();
    },
    setPaused(p) {
      paused = p;
      if (p) stop();
      else if (!reducedMotion) start();
    },
    dispose() {
      stop();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
        for (const m of mats as (THREE.Material & { map?: THREE.Texture | null; emissiveMap?: THREE.Texture | null })[]) {
          m.map?.dispose();
          m.emissiveMap?.dispose();
          m.dispose();
        }
      });
      for (const t of [ctx.glow, ctx.soft, ctx.shadow]) t.dispose();
      composer?.dispose();
      renderer.dispose();
    },
  };
}
