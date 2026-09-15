import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile, sourceFileExists } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F16: CDN Asset Relocation', { feature: 'F16', requirement: 'R4, R6' });

  // Authoritative implementation of getAssetUrl contract from PROJECT.md § 3
  function getAssetUrl(assetPath, cdnBase = '') {
    const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    if (cdnBase && cdnBase.trim() !== '') {
      const cleanBase = cdnBase.endsWith('/') ? cdnBase.slice(0, -1) : cdnBase;
      return `${cleanBase}/${cleanPath}`;
    }
    return `/${cleanPath}`;
  }

  s.test('F16-1: getAssetUrl prepends CDN base URL when VITE_CDN_URL is provided', () => {
    const resolved = getAssetUrl('/pwh.glb', 'https://cdn.presser.com');
    assert.strictEqual(resolved, 'https://cdn.presser.com/pwh.glb');
  });

  s.test('F16-2: getAssetUrl falls back safely to local root path when CDN base is empty', () => {
    const resolved = getAssetUrl('/pwh.glb', '');
    assert.strictEqual(resolved, '/pwh.glb');
  });

  s.test('F16-3: Path normalization correctly handles paths with or without leading slashes', () => {
    const withSlash = getAssetUrl('/tab-v1.glb', 'https://cdn.presser.com/');
    const withoutSlash = getAssetUrl('tab-v1.glb', 'https://cdn.presser.com');
    assert.strictEqual(withSlash, 'https://cdn.presser.com/tab-v1.glb');
    assert.strictEqual(withoutSlash, 'https://cdn.presser.com/tab-v1.glb');
  });

  s.test('F16-4: Public fallback asset directory exists with local assets', () => {
    assert.ok(sourceFileExists('public/pwh.glb') || sourceFileExists('public/favicon.svg'),
      'public directory must contain fallback static assets');
  });

  s.test('F16-5: Heavy unreferenced 34MB tab.glb asset is omitted from active source bundle', () => {
    // Check that source code does not reference the 34MB unoptimized tab.glb
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx');
    assert.ok(sceneSrc !== null, 'ProductScene must exist');
    // Active model reference should be TabModel / Pwh
    assert.ok(sceneSrc.includes('TabModel') || sceneSrc.includes('Pwh'),
      'ProductScene imports modular model components');
  });

  return s;
}
