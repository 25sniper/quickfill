# Master Execution Plan: Presser Frontend Improvements

## Objectives & Scope
Improve the Presser frontend UI/UX, accessibility, performance, and code quality according to requirements R1-R6:
- R1: Centralized color theme, extract Tailwind classes, loading spinners, typography hierarchy.
- R2: React Router navigation, tutorial modal, reduced-motion preferences.
- R3: ARIA labels, focus rings, WCAG AA contrast.
- R4: Lazy-load 3D scene, memoize keyframes, CDN asset relocation, frustum culling.
- R5: Constants for magic numbers, modularize ProductScene.tsx, TypeScript typings, unit tests.
- R6: Asset relocation (CDN / src/assets/), documentation.

## Phase Breakdown

### Phase 0: Survey & Exploration (Current)
- Spawn 3 parallel `teamwork_preview_explorer` subagents to investigate:
  1. Explorer 1: Project structure, dependencies, build/test setup, package.json, routing, asset paths.
  2. Explorer 2: UI/UX & Styling: Tailwind config, color theme, typography, current components, navigation, modal requirements, reduced-motion.
  3. Explorer 3: 3D Scene (`ProductScene.tsx`), Three.js / React Three Fiber usage, keyframe animation, frustum culling, performance bottlenecks, asset sizes.

### Phase 1: Synthesis & Decomposition
- Synthesize explorer findings into `PROJECT.md` at project root:
  - Feature Inventory (mapping every feature from R1-R6 to milestones).
  - Architecture, Code Layout, Interface Contracts.
- Define Milestone breakdown (e.g. M1: Theme, Typography & Tailwind Refactoring; M2: Navigation, Modal & UX/Motion; M3: Accessibility Upgrades; M4: 3D Scene Modularization & Performance; M5: Project Structure, Assets & Documentation; M6: Final Milestone E2E & Unit Test Integration).
- Define E2E Testing architecture in `TEST_INFRA.md`.

### Phase 2: Dual Track Execution
- Track 1: E2E Testing Orchestrator (Opaque-box test suite: Tiers 1-4).
- Track 2: Implementation Milestones via Sub-Orchestrators (Explorer -> Worker -> Reviewer -> Challenger -> Auditor).

### Phase 3: Acceptance & Hardening
- Final Milestone: Pass 100% of E2E tests + Tier 5 Adversarial Coverage Hardening.
- Final Forensic Audit.
- Completion report to Sentinel.
