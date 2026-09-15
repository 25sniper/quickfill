## 2026-09-10T15:57:15Z
Investigate and design the implementation blueprint for Features F14 and F15:
- F14: Frustum Culling & Visibility Toggling:
  - Inspect `TutorialTap` and `ScrollModel`.
  - When scroll is outside the tutorial section, toggle `visible = false` on `TutorialTap` to prevent unnecessary render calls.
  - Ensure all meshes have `frustumCulled = true` and compute/update bounding spheres during GLTF loading/traversal.
  - Check assertions in `tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs`.
- F15: Strict TypeScript Typings:
  - Eliminate all `any` types across the 3D scene code (GLTF traversals, materials, event callbacks, error handling).
  - Define strict interfaces in `src/components/scene/types.ts`: `Keyframe`, `MotionState`, `SceneProps`, `ModelProps`, `GLTFResult`, etc.
  - Check assertions in `tests/e2e/tier1-feature-coverage/f15-typescript-typings.test.mjs`.
Write handoff report to `a:\downloads\presser\.agents\explorer_m3_3\handoff.md`.
