# Progress — Feature F13 Investigation

Last visited: 2026-09-10T16:05:00Z

## Status
- [x] Read mandatory files: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `ProductScene.tsx`, `f13-memoize-keyframes.test.mjs`.
- [x] Inspected test suites:
  - `tests/e2e/tier1-feature-coverage/f13-memoize-keyframes.test.mjs`
  - `tests/e2e/helpers/scene-math.mjs`
  - `tests/e2e/tier2-boundary-corner/f11-f15-scene-math-boundaries.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f11-modular-scene.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f12-magic-numbers.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f15-typescript-types.test.mjs`
  - `tests/e2e/tier3-cross-feature/motion-scene-performance-combos.test.mjs`
- [x] Analyzed current `evalAt` function, `PRESSER_KFS`, `TAP_KFS`, `RX`, `RY` in `ProductScene.tsx`.
- [x] Identified all garbage collection and heap allocation sources in `useFrame`:
  - Per-frame array cloning and sorting in `evalAt`
  - Per-frame allocation of `pos` and `rot` tuples and `MotionState` objects
  - Per-frame closure instantiation of `d = (a, b) => THREE.MathUtils.damp(...)`
  - Per-frame `THREE.Vector3` instantiation by `pathCurve.getPoint(t)`
  - Per-render array allocations of `RX`, `RY`, `RZ` control points
- [x] Designed `src/components/scene/animation.ts` architecture with:
  - `getSortedKeyframes`: pre-sorting with `WeakMap` cache
  - `evalAt`: pure keyframe interpolation with zero division-by-zero risk and clamping
  - `evalAtTarget`: zero-allocation target evaluation
  - `evalAtMemoized`: WeakMap-backed caching with epsilon threshold (1e-5)
  - `createKeyframeEvaluator`: dedicated closure evaluator factory
  - `lerp` and `damp`: pure numerical interpolation
- [x] Designed integration blueprint for `useFrame` in `TutorialTap` and `ScrollModel`.
- [x] Synthesizing comprehensive handoff report into `handoff.md`.
