# BRIEFING — 2026-09-10T16:01:15Z

## Mission
Investigate and design implementation blueprint for Features F14 (Frustum Culling & Visibility Toggling) and F15 (Strict TypeScript Typings).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: a:\downloads\presser\.agents\explorer_m3_3
- Original parent: 1d693b99-1b39-4f36-a45f-ea64a8fb1005
- Milestone: M3 (Features F14 & F15)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Scope: F14 (Frustum culling, visibility toggling in TutorialTap & ScrollModel, bounding spheres) and F15 (strict TypeScript typings in 3D scene code, types.ts, eliminating `any`)
- Handoff report to `a:\downloads\presser\.agents\explorer_m3_3\handoff.md`
- Inform parent orchestrator via send_message when done

## Current Parent
- Conversation ID: 1d693b99-1b39-4f36-a45f-ea64a8fb1005
- Updated: 2026-09-10T16:01:15Z

## Investigation State
- **Explored paths**:
  - `src/components/ProductScene.tsx`
  - `src/components/Pwh.tsx`
  - `src/components/TabModel.tsx`
  - `src/components/scene/ProductSceneFallback.tsx`
  - `src/AdminDashboard.tsx`
  - `src/Checkout.tsx`
  - `src/api.ts`
  - `src/main.tsx`
  - `src/hooks/useReducedMotion.ts`
  - `tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs`
  - `tests/e2e/tier1-feature-coverage/f15-typescript-types.test.mjs`
  - `tests/e2e/tier2-boundary-corner/f11-f15-scene-math-boundaries.test.mjs`
  - `tests/e2e/tier3-cross-feature/motion-scene-performance-combos.test.mjs`
- **Key findings**:
  - `TutorialTap` currently only damps scale to 0 when off-screen; `ref.current.visible` is never set to false, leading to unnecessary matrix updates and render passes.
  - GLTF traversals in `Pwh.tsx` and `TabModel.tsx` use `child: any`, do not set `mesh.frustumCulled = true`, and do not call `computeBoundingSphere()` / `computeBoundingBox()`.
  - `tsconfig.app.json` enforces `verbatimModuleSyntax: true`, meaning type imports MUST use `import type`.
  - `src/components/scene/types.ts` is currently missing and must define `Keyframe`, `MotionState`, `SceneProps`, `ModelProps`, `GLTFResult`, etc.
  - Catch blocks in `AdminDashboard.tsx` and `Checkout.tsx` use `err: any` instead of `err: unknown` / `err instanceof Error`.
- **Unexplored areas**: None for F14/F15.

## Key Decisions Made
- Architected `src/components/scene/types.ts` with complete type definitions and backward compatibility aliases (`KF`, `MS`, `ProductSceneProps`).
- Designed GLTF traversal pattern using `child instanceof THREE.Mesh` to eliminate `any` completely while enforcing `frustumCulled = true` and computing bounds.
- Designed `TutorialTap` visibility toggling with both early return in `useFrame` when outside `[TUTORIAL_START, TUTORIAL_END]` and `visible` prop on the group.
- Ready to write comprehensive `handoff.md`.

## Artifact Index
- DISPATCH.md — incoming dispatch instructions
- progress.md — liveness heartbeat and checklist
- BRIEFING.md — persistent situational memory
- handoff.md — comprehensive handoff report for implementers
