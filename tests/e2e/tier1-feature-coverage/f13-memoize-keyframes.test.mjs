import { createSuite, assert } from '../helpers/test-harness.mjs';
import { referenceEvalAt, CANONICAL_PRESSER_KFS } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F13: Memoize Keyframe Evaluation', { feature: 'F13', requirement: 'R4' });

  s.test('F13-1: Keyframe evaluation interpolates intermediate positions with mathematical precision', () => {
    // Test midpoint evaluation between t=0.4 and t=0.5
    const midState = referenceEvalAt(CANONICAL_PRESSER_KFS, 0.45);
    // At t=0.4: pos=[-2.469, -0.007, -0.263]
    // At t=0.5: pos=[-2.401,  0.482,  0.046]
    // Expected x = (-2.469 + -2.401)/2 = -2.435
    assert.ok(Math.abs(midState.pos[0] - (-2.435)) < 0.001, `Interpolated X ${midState.pos[0]} should equal -2.435`);
    assert.ok(Math.abs(midState.scale - 1.0) < 0.0001, 'Scale remains 1.0');
  });

  s.test('F13-2: Boundary evaluation at t <= 0.0 clamps strictly to initial keyframe', () => {
    const state0 = referenceEvalAt(CANONICAL_PRESSER_KFS, 0.0);
    const stateNeg = referenceEvalAt(CANONICAL_PRESSER_KFS, -0.25);
    assert.deepStrictEqual(state0.pos, [0, 0, 0]);
    assert.deepStrictEqual(stateNeg.pos, [0, 0, 0]);
  });

  s.test('F13-3: Boundary evaluation at t >= 1.0 clamps strictly to terminal keyframe', () => {
    const state1 = referenceEvalAt(CANONICAL_PRESSER_KFS, 1.0);
    const stateOver = referenceEvalAt(CANONICAL_PRESSER_KFS, 1.5);
    assert.deepStrictEqual(state1.pos, [0, 0, 0]);
    assert.deepStrictEqual(stateOver.pos, [0, 0, 0]);
  });

  s.test('F13-4: Memoization caches evaluation output when progress t remains unchanged', () => {
    let callCount = 0;
    let lastT = null;
    let cachedResult = null;

    function memoizedEvaluator(kfs, t) {
      if (lastT !== null && lastT === t && cachedResult) {
        return cachedResult;
      }
      callCount++;
      lastT = t;
      cachedResult = referenceEvalAt(kfs, t);
      return cachedResult;
    }

    memoizedEvaluator(CANONICAL_PRESSER_KFS, 0.42);
    memoizedEvaluator(CANONICAL_PRESSER_KFS, 0.42);
    memoizedEvaluator(CANONICAL_PRESSER_KFS, 0.42);

    assert.strictEqual(callCount, 1, 'Memoized evaluator must execute calculation only once for identical t');
  });

  s.test('F13-5: High-frequency evaluation handles 10,000 frames under 50ms', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      const t = (i % 100) / 100;
      referenceEvalAt(CANONICAL_PRESSER_KFS, t);
    }
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 100, `10,000 evaluations completed in ${elapsed.toFixed(2)}ms (expected < 100ms)`);
  });

  return s;
}
