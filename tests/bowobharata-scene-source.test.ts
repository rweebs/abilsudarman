import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const dir = 'src/lib/bowobharata/scene';
const main = readFileSync('src/lib/bowobharata/KurukshetraScene.ts', 'utf8');
const modules = [
  'environment', 'army', 'chariot', 'pavilion', 'effects', 'quality', 'anatomy', 'rig', 'creatures', 'battle',
  'materials', 'texturegen', 'motion', 'reflections', 'post',
];
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
  it('builds the post chain only when the tier has post effects, and sheds effects in order when frames are slow', () => {
    expect(main).toMatch(/if \(quality\.bloom \|\| quality\.ao \|\| quality\.dof\) post = createPost\(/);
    expect(main).toContain('shouldDropBloom(');
    expect(main).toContain('degrade(fx)');
  });
  it('turns on shadows only for tiers that allow them, and can turn them back off', () => {
    expect(main).toMatch(/if \(fx\.shadows\) \{/);
    expect(main).toContain('setShadows(false)');
    expect(main).toContain("m.name !== 'terrain'");
  });
  it('lights metals from the sky through a reflection probe that is disposed with the scene', () => {
    expect(main).toContain('createProbe(');
    expect(main).toContain('probe.dispose()');
  });
  it('keeps motion off under reduced motion, including the handheld camera', () => {
    expect(main).toContain('handheld(time, reducedMotion ? 0 : 1)');
  });
  it('survives a lost WebGL context by telling the caller', () => {
    expect(main).toContain("'webglcontextlost'");
    expect(main).toContain('onLost?.()');
  });
  it('does not loop under reduced motion and disposes GPU resources and textures', () => {
    expect(main).toMatch(/if \(!reducedMotion\) start\(\)/);
    expect(main).toContain('renderer.dispose()');
    expect(main).toContain('post?.dispose()');
    expect(main).toMatch(/\.normalMap\?\.dispose\(\)/);
    expect(main).toContain('geometry.dispose()');
    expect(main).toMatch(/\.map\?\.dispose\(\)/);
  });
});
