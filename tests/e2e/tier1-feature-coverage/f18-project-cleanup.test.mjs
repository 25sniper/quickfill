import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile, sourceFileExists } from '../helpers/dom-simulator.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F18: Project Cleanup & Asset Structure', { feature: 'F18', requirement: 'R6' });

  s.test('F18-1: src/assets directory structure exists for static assets', () => {
    assert.ok(sourceFileExists('src/assets'), 'src/assets directory must exist');
  });

  s.test('F18-2: src/components directory exists for modular components', () => {
    assert.ok(sourceFileExists('src/components'), 'src/components directory must exist');
  });

  s.test('F18-3: package.json is syntactically valid JSON', () => {
    const pkgRaw = readSourceFile('package.json');
    assert.ok(pkgRaw !== null, 'package.json must exist');
    let parsed = null;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(pkgRaw);
    }, 'package.json must be valid JSON');
    assert.ok(parsed.name && parsed.dependencies, 'package.json must contain valid manifest properties');
  });

  s.test('F18-4: Tailwind CSS v4 is configured via modern bundler integration', () => {
    const pkgRaw = readSourceFile('package.json');
    const viteConfig = readSourceFile('vite.config.ts');
    const hasTailwind = pkgRaw.includes('@tailwindcss/vite') && viteConfig.includes('tailwindcss()');
    assert.ok(hasTailwind, 'Tailwind v4 Vite plugin must be configured');
  });

  s.test('F18-5: Project avoids legacy App.css collision in main entry', () => {
    const mainSrc = readSourceFile('src/main.tsx');
    assert.ok(mainSrc.includes('index.css'), 'main.tsx must import centralized index.css');
    // App.css should not be imported in main.tsx
    assert.ok(!mainSrc.includes('App.css'), 'main.tsx must not import legacy App.css');
  });

  return s;
}
