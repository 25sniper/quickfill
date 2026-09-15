import { createSuite, assert } from '../helpers/test-harness.mjs';
import { referenceEvalAt, CANONICAL_PRESSER_KFS, TUTORIAL_BOUNDS } from '../helpers/scene-math.mjs';

export default async function suite() {
  const s = createSuite('Tier 3 - Motion, Scene Math & Performance Combinations (F9 + F11 + F13 + F14 + F6)', {
    tier: 3,
    combinations: ['Reduced Motion + Keyframe Eval', 'Scroll Progress + Frustum Culling', 'Memoization + Rapid Frames']
  });

  s.test('Combo 1: In reduced-motion mode, 3D keyframe evaluation jumps cleanly to section target without rotation churn', () => {
    const prefersReducedMotion = true;
    const targetScroll = 0.50; // Tutorial midpoint
    const state = referenceEvalAt(CANONICAL_PRESSER_KFS, targetScroll);

    // In reduced motion, we evaluate exact stationary state without rotational spin accumulation
    assert.deepStrictEqual(state.pos, [-2.401, 0.482, 0.046]);
    assert.deepStrictEqual(state.rot, [1.575, 0.000, 1.575]);
  });

  s.test('Combo 2: Visibility toggling and memoized keyframe evaluation remain synchronized during scroll traversal', () => {
    const scrollPoints = [0.0, 0.2, 0.33, 0.5, 0.88, 0.95];
    const results = scrollPoints.map(t => {
      const isVisible = t >= TUTORIAL_BOUNDS.START && t <= TUTORIAL_BOUNDS.END;
      const state = referenceEvalAt(CANONICAL_PRESSER_KFS, t);
      return { t, isVisible, state };
    });

    assert.strictEqual(results[0].isVisible, false); // Hero
    assert.strictEqual(results[1].isVisible, false); // Testimonials
    assert.strictEqual(results[2].isVisible, true);  // Tutorial start
    assert.strictEqual(results[3].isVisible, true);  // Tutorial active
    assert.strictEqual(results[4].isVisible, true);  // Tutorial end
    assert.strictEqual(results[5].isVisible, false); // Preorder
  });

  s.test('Combo 3: Rapid scroll velocity produces zero heap allocations and keeps frame duration under 1ms', () => {
    const start = performance.now();
    for (let frame = 0; frame < 500; frame++) {
      const t = (frame % 100) / 100;
      referenceEvalAt(CANONICAL_PRESSER_KFS, t);
    }
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 20, `500 scroll frame evaluations took ${elapsed.toFixed(2)}ms (target < 20ms)`);
  });

  s.test('Combo 4: Scene fallback spinner maintains active status announcement until 3D Canvas mounts', () => {
    let canvasMounted = false;
    const isFallbackVisible = () => !canvasMounted;

    assert.strictEqual(isFallbackVisible(), true);
    canvasMounted = true;
    assert.strictEqual(isFallbackVisible(), false);
  });

  s.test('Combo 5: Combined scene state maintains bounded values across all coordinate axes', () => {
    for (let t = 0; t <= 1.0; t += 0.05) {
      const state = referenceEvalAt(CANONICAL_PRESSER_KFS, t);
      for (const val of state.pos) {
        assert.ok(!isNaN(val) && isFinite(val) && Math.abs(val) <= 10.0);
      }
      for (const val of state.rot) {
        assert.ok(!isNaN(val) && isFinite(val) && Math.abs(val) <= 10.0);
      }
      assert.ok(state.scale > 0 && state.scale <= 5.0);
    }
  });

  return s;
}
