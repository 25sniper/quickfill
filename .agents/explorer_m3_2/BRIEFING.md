# BRIEFING — 2026-09-10T16:06:00Z

## Mission
Investigate and design implementation blueprint for Feature F13: Memoize Keyframe Evaluation & Math Optimization.

## 🔒 My Identity
- Archetype: explorer
- Roles: [explorer, analyst, architect]
- Working directory: a:\downloads\presser\.agents\explorer_m3_2
- Original parent: 1d693b99-1b39-4f36-a45f-ea64a8fb1005
- Milestone: M3-2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Eliminate GC and heap allocations inside useFrame
- Pre-sort keyframes once at module initialization
- Cache keyframe evaluations with epsilon threshold
- Verify compliance with tests/e2e/tier1-feature-coverage/f13-memoize-keyframes.test.mjs

## Current Parent
- Conversation ID: 1d693b99-1b39-4f36-a45f-ea64a8fb1005
- Updated: 2026-09-10T16:06:00Z

## Investigation State
- **Explored paths**:
  - `src/components/ProductScene.tsx` (lines 12-33, 69-92, 172-214)
  - `tests/e2e/tier1-feature-coverage/f13-memoize-keyframes.test.mjs`
  - `tests/e2e/helpers/scene-math.mjs`
  - `tests/e2e/tier2-boundary-corner/f11-f15-scene-math-boundaries.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f11-modular-scene.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f12-magic-numbers.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f15-typescript-types.test.mjs`
  - `tests/e2e/tier3-cross-feature/motion-scene-performance-combos.test.mjs`
- **Key findings**:
  - `evalAt` currently creates array clone and sorts on every single frame, allocating tuples and objects.
  - `useFrame` in `ScrollModel` allocates `new THREE.Vector3` on every frame via `pathCurve.getPoint(t)` because optional target is omitted.
  - `useFrame` in both models creates closure `d` on every frame.
  - Static control arrays `RX`, `RY`, `RZ` are created inside `ScrollModel` on every component render.
  - Epsilon caching with `1e-5` threshold in `evalAtMemoized` guarantees 0 allocations when stationary and instantaneous return.
- **Unexplored areas**: None for F13.

## Key Decisions Made
- Architecture for `src/components/scene/animation.ts` designed with `evalAt`, `evalAtMemoized`, `evalAtTarget`, `getSortedKeyframes`, `lerp`, `damp`, and `createKeyframeEvaluator`.
- Pre-sorting uses `WeakMap` cache and checks `isAlreadySorted` to avoid unnecessary work.
- `evalAtMemoized` uses `WeakMap` cache keyed by keyframe sequence with `EPSILON = 1e-5` to avoid thrashing between `TAP_KFS` and `PRESSER_KFS`.
- `pathCurve.getPoint(t, target)` with pre-allocated vector eliminates Three.js heap allocations in `useFrame`.
- Comprehensive handoff report drafted for implementer.

## Artifact Index
- a:\downloads\presser\.agents\explorer_m3_2\DISPATCH.md — Dispatch log
- a:\downloads\presser\.agents\explorer_m3_2\BRIEFING.md — Situational awareness
- a:\downloads\presser\.agents\explorer_m3_2\progress.md — Liveness heartbeat
- a:\downloads\presser\.agents\explorer_m3_2\handoff.md — Final handoff report
