import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F11: Modularize ProductScene.tsx', { feature: 'F11', requirement: 'R5' });

  s.test('F11-1: ProductScene is cleanly exportable and mountable', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/ProductScene.tsx');
    assert.ok(sceneSrc !== null, 'ProductScene must exist');
    assert.ok(sceneSrc.includes('export function ProductScene') || sceneSrc.includes('export default') || sceneSrc.includes('export const ProductScene'),
      'ProductScene must export a React component');
  });

  s.test('F11-2: Three.js Fiber Canvas is encapsulated within the scene hierarchy', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/ProductScene.tsx');
    assert.ok(sceneSrc.includes('<Canvas') || sceneSrc.includes('Canvas'),
      'ProductScene must contain the React Three Fiber Canvas');
  });

  s.test('F11-3: TapModel is isolated as a dedicated sub-component', () => {
    const tapSrc = readSourceFile('src/components/TabModel.tsx') || readSourceFile('src/components/scene/TapModel.tsx');
    assert.ok(tapSrc !== null, 'TapModel sub-component must exist');
    assert.ok(tapSrc.includes('tab') || tapSrc.includes('useGLTF'), 'TapModel loads model asset');
  });

  s.test('F11-4: Presser model (Pwh) is isolated as a dedicated sub-component', () => {
    const pwhSrc = readSourceFile('src/components/Pwh.tsx') || readSourceFile('src/components/scene/PresserModel.tsx');
    assert.ok(pwhSrc !== null, 'Presser model sub-component must exist');
    assert.ok(pwhSrc.includes('pwh') || pwhSrc.includes('useGLTF'), 'Presser model loads GLTF geometry');
  });

  s.test('F11-5: ProductScene integrates lighting and environment configuration', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/ProductScene.tsx');
    const lightingSrc = readSourceFile('src/components/scene/Lighting.tsx');
    const hasLighting = (sceneSrc && (sceneSrc.includes('Environment') || sceneSrc.includes('directionalLight') || sceneSrc.includes('ambientLight'))) ||
                        (lightingSrc !== null);
    assert.ok(hasLighting, 'Scene must integrate lighting setup');
  });

  return s;
}
