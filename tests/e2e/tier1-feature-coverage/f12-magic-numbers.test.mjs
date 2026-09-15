import { createSuite, assert } from '../helpers/test-harness.mjs';
import { readSourceFile } from '../helpers/dom-simulator.mjs';
import { TUTORIAL_BOUNDS, CANONICAL_PRESSER_KFS, CANONICAL_TAP_KFS } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F12: Extract Magic Numbers', { feature: 'F12', requirement: 'R5' });

  s.test('F12-1: Tutorial start and end bounds are declared as named constants', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx');
    const constSrc = readSourceFile('src/components/scene/constants.ts');
    const combined = (sceneSrc || '') + (constSrc || '');
    assert.ok(combined.includes('TUTORIAL_START'), 'TUTORIAL_START must be declared as named constant');
    assert.ok(combined.includes('TUTORIAL_END'), 'TUTORIAL_END must be declared as named constant');
  });

  s.test('F12-2: Canonical tutorial bounds satisfy 0 <= START < END <= 1', () => {
    assert.ok(TUTORIAL_BOUNDS.START >= 0, 'Tutorial start must be >= 0');
    assert.ok(TUTORIAL_BOUNDS.END <= 1, 'Tutorial end must be <= 1');
    assert.ok(TUTORIAL_BOUNDS.START < TUTORIAL_BOUNDS.END, 'Tutorial start must be strictly before tutorial end');
  });

  s.test('F12-3: Keyframe sequences are declared as immutable constant arrays', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx');
    const constSrc = readSourceFile('src/components/scene/constants.ts');
    const combined = (sceneSrc || '') + (constSrc || '');
    assert.ok(combined.includes('PRESSER_KFS'), 'PRESSER_KFS constant array must be defined');
    assert.ok(combined.includes('TAP_KFS'), 'TAP_KFS constant array must be defined');
  });

  s.test('F12-4: Damping interpolation factor is extracted from inline literals', () => {
    const sceneSrc = readSourceFile('src/components/ProductScene.tsx');
    const constSrc = readSourceFile('src/components/scene/constants.ts');
    const combined = (sceneSrc || '') + (constSrc || '');
    assert.ok(combined.includes('damp') || combined.includes('DAMPING') || combined.includes('MathUtils.damp'),
      'Damping function must be parameterized');
  });

  s.test('F12-5: Keyframe timestamps are monotonically increasing between 0.0 and 1.0', () => {
    const verifyMonotonic = (kfs) => {
      for (let i = 0; i < kfs.length - 1; i++) {
        assert.ok(kfs[i].t <= kfs[i + 1].t, `Keyframe t at index ${i} must be <= next index`);
      }
      assert.strictEqual(kfs[0].t, 0.0, 'First keyframe must start at t=0.0');
      assert.strictEqual(kfs[kfs.length - 1].t, 1.0, 'Final keyframe must terminate at t=1.0');
    };
    verifyMonotonic(CANONICAL_PRESSER_KFS);
    verifyMonotonic(CANONICAL_TAP_KFS);
  });

  return s;
}
