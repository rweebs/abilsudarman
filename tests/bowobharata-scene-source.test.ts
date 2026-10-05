import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const dir = 'src/lib/bowobharata/scene';
const main = readFileSync('src/lib/bowobharata/KurukshetraScene.ts', 'utf8');
const modules = ['environment', 'army', 'chariot', 'pavilion', 'effects', 'quality'];
const all = () => [main, ...readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => readFileSync(`${dir}/${f}`, 'utf8'))];

describe('KurukshetraScene source guards', () => {
  it('is split into focused scene modules', () => {
    for (const m of modules) expect(existsSync(`${dir}/${m}.ts`), m).toBe(true);
  });
  it('loads no model or image files anywhere: everything is procedural', () => {
    for (const src of all()) expect(src).not.toMatch(/GLTFLoader|TextureLoader|OBJLoader|FBXLoader|\.glb|\.gltf|\.png|\.jpe?g|\.hdr/);
  });
  it('sizes itself from the quality tier', () => {
    expect(main).toContain('qualityFor(mobile, window.devicePixelRatio || 1)');
    expect(main).toContain('renderer.setPixelRatio(quality.pixelRatio)');
  });
  it('uses bloom only when the tier allows it, and drops it when frames are slow', () => {
    expect(main).toMatch(/if \(quality\.bloom\)/);
    expect(main).toContain('shouldDropBloom(');
  });
  it('survives a lost WebGL context by telling the caller', () => {
    expect(main).toContain("'webglcontextlost'");
    expect(main).toContain('onLost?.()');
  });
  it('does not loop under reduced motion and disposes GPU resources and textures', () => {
    expect(main).toMatch(/if \(!reducedMotion\) start\(\)/);
    expect(main).toContain('renderer.dispose()');
    expect(main).toContain('composer?.dispose()');
    expect(main).toContain('geometry.dispose()');
    expect(main).toMatch(/\.map\?\.dispose\(\)/);
  });
});
