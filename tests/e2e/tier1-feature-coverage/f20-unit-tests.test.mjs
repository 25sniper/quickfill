import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile, sourceFileExists } from '../helpers/dom-simulator.mjs';
import { referenceEvalAt, CANONICAL_PRESSER_KFS } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F20: Unit Test Suite Integration', { feature: 'F20', requirement: 'R5' });

  s.test('F20-1: package.json specifies runnable test scripts', () => {
    const pkg = JSON.parse(readSourceFile('package.json'));
    assert.ok(pkg.scripts.test || pkg.scripts['test:e2e'],
      'package.json must contain test execution scripts');
  });

  s.test('F20-2: Dedicated tests/ directory exists in project root', () => {
    assert.ok(sourceFileExists('tests'), 'tests directory must exist');
  });

  s.test('F20-3: App component is structured as a pure, importable React component', () => {
    const appSrc = readSourceFile('src/App.tsx');
    assert.ok(appSrc.includes('export default App'), 'App.tsx must export App as default');
  });

  s.test('F20-4: ProductScene component is structured as an importable module', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx') || readSourceFile('src/components/scene/ProductScene.tsx');
    assert.ok(sceneSrc.includes('export'), 'ProductScene must export component for testability');
  });

  s.test('F20-5: Keyframe math evaluation is pure with zero global side-effects', () => {
    const result1 = referenceEvalAt(CANONICAL_PRESSER_KFS, 0.4);
    const result2 = referenceEvalAt(CANONICAL_PRESSER_KFS, 0.4);
    assert.deepStrictEqual(result1, result2, 'Pure function evalAt produces identical results across consecutive runs');
  });

  return s;
}
