import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F17: Lazy-Load 3D Scene & Code Splitting', { feature: 'F17', requirement: 'R4' });

  s.test('F17-1: Suspense boundary encapsulates 3D WebGL scene', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('<Suspense') && appSrc.includes('</Suspense>'),
      'App.tsx must wrap ProductScene in Suspense boundary');
  });

  s.test('F17-2: Suspense boundary defines fallback property', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('fallback='), 'Suspense boundary must provide fallback property');
  });

  s.test('F17-3: Vite configuration vite.config.ts enables React plugin', () => {
    const viteConfig = readSourceFile('vite.config.ts');
    assert.ok(viteConfig.includes('@vitejs/plugin-react') || viteConfig.includes('react()'),
      'vite.config.ts must configure React plugin');
  });

  s.test('F17-4: ProductScene component provides default or named export for dynamic loading', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/ProductScene.tsx');
    assert.ok(sceneSrc.includes('export default') || sceneSrc.includes('export function ProductScene') || sceneSrc.includes('export const ProductScene'),
      'ProductScene must be exportable for lazy loading');
  });

  s.test('F17-5: 3D Canvas is partitioned into dedicated foreground layer', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('z-40') || appSrc.includes('pointer-events-none'),
      'Canvas container must be positioned as a non-blocking overlay layer');
  });

  return s;
}
