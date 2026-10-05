import type * as THREE from 'three';
import { instantiate, type LoadedModels, type Rig } from './models';

/**
 * Replaces a procedural figure's body with the real skinned mannequin playing `clip`, painted in `skin`. Everything the caller
 * added to the figure afterwards (garments, crown, gear) stays; only the parts the figure tagged as body are hidden.
 */
export function dressHero(figure: THREE.Group, models: LoadedModels, clip: string, skin: string, offset = 0): Rig {
  figure.traverse((n) => { if (n.userData.body) n.visible = false; });
  const rig = instantiate(models.base, { height: 1.8, faceBones: ['DEF-foot.L', 'DEF-toe.L'] });
  rig.tint({ M_Main: skin, M_Joints: skin }, { roughness: 0.55, metalness: 0 });
  rig.play(clip, offset);
  figure.add(rig.root);
  return rig;
}
