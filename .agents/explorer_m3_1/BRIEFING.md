# BRIEFING — 2026-09-10T16:03:00Z

## Mission
Investigate and design the implementation blueprint for Features F11 (ProductScene modularization) and F12 (Magic Numbers extraction).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, analyzer, architect
- Working directory: a:\downloads\presser\.agents\explorer_m3_1
- Original parent: 1d693b99-1b39-4f36-a45f-ea64a8fb1005
- Milestone: M3 (F11, F12)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code directly
- Modularize `src/components/ProductScene.tsx` into `src/components/scene/`:
  - `types.ts`
  - `constants.ts`
  - `Lighting.tsx`
  - `CameraController.tsx`
  - `PresserModel.tsx`
  - `TapModel.tsx`
  - `TutorialTap.tsx`
  - `ProductScene.tsx` (main composite scene)
  - Ensure `src/components/ProductScene.tsx` cleanly re-exports `ProductScene` for backward compatibility with `src/App.tsx`.
- Centralize magic numbers in `src/components/scene/constants.ts` (camera positions/FOV, lighting colors/intensities, damping factors, tutorial scroll thresholds TUTORIAL_START/TUTORIAL_END, spline arrays).
- Check and ensure 100% compliance with assertions in `f11-product-scene.test.mjs` and `f12-magic-numbers.test.mjs`.

## Current Parent
- Conversation ID: 1d693b99-1b39-4f36-a45f-ea64a8fb1005
- Updated: 2026-09-10T16:03:00Z

## Investigation State
- **Explored paths**:
  - `PROJECT.md`, `.agents/ORIGINAL_REQUEST.md`
  - `src/components/ProductScene.tsx`, `src/components/Pwh.tsx`, `src/components/TabModel.tsx`, `src/components/scene/ProductSceneFallback.tsx`
  - `src/App.tsx`, `src/routes.tsx`, `src/main.tsx`
  - `tests/e2e/tier1-feature-coverage/f11-modular-scene.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f12-magic-numbers.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f09-reduced-motion.test.mjs`, `f13-memoize-keyframes.test.mjs`, `f14-frustum-culling.test.mjs`, `f15-typescript-types.test.mjs`, `f16-cdn-assets.test.mjs`, `f17-lazy-loading.test.mjs`, `f20-unit-tests.test.mjs`
  - `tests/e2e/tier2-boundary-corner/f11-f15-scene-math-boundaries.test.mjs`
  - `tests/e2e/tier3-cross-feature/motion-scene-performance-combos.test.mjs`
  - `tests/e2e/helpers/scene-math.mjs`, `dom-simulator.mjs`
- **Key findings**:
  - Exact test filename is `f11-modular-scene.test.mjs` (not `f11-product-scene.test.mjs`).
  - Critical discovery: tests `f09-3`, `f14-5`, and `f16-5` inspect `src/components/ProductScene.tsx` directly via `readSourceFile`. Therefore, `src/components/ProductScene.tsx` cannot be an empty re-export; it must declare a wrapper exporting `ProductScene`, re-exporting `TabModel`, `Pwh`, constants, and referencing `<Canvas>`, `<group>`, and `MathUtils.damp`.
  - Constants in `src/components/scene/constants.ts` must declare `TUTORIAL_START`, `TUTORIAL_END`, `TUTORIAL_BOUNDS` (frozen), `PRESSER_KFS`, `TAP_KFS`, `DAMPING_CONFIG`, `CAMERA_CONFIG`, `LIGHTING_CONFIG`, and `ANIMATION_CONFIG`.
  - Splitting into 10 target files (`types.ts`, `constants.ts`, `animation.ts`, `Lighting.tsx`, `CameraController.tsx`, `TapModel.tsx`, `PresserModel.tsx`, `TutorialTap.tsx`, `scene/ProductScene.tsx`, `scene/index.ts`, and root `ProductScene.tsx`) satisfies 100% of contracts and tests.
- **Unexplored areas**: None.

## Key Decisions Made
- Modularize into dedicated sub-components in `src/components/scene/`.
- Provide `animation.ts` with `evalAt` and `evalAtMemoized` to support keyframe evaluation and caching for M3 F13.
- Structure `src/components/ProductScene.tsx` as a backward-compatible wrapper that re-exports all sub-components and satisfies all static test assertions.
- Eliminate all `any` types in GLTF traversals and replace with strict Three.js object types (`THREE.Mesh`, `THREE.Object3D`).

## Artifact Index
- `DISPATCH.md` — Log of incoming dispatches
- `progress.md` — Liveness heartbeat and task tracker
- `BRIEFING.md` — Situational awareness working memory
- `handoff.md` — Comprehensive handoff report with exact file blueprints
