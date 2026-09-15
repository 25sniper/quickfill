# BRIEFING — 2026-09-10T15:06:00Z

## Mission
Survey the Presser frontend repository architecture, dependencies, build/test tooling, bundle size, file tree, routing, entry points, and asset/CDN references.

## 🔒 My Identity
- Archetype: explorer
- Roles: survey, investigation
- Working directory: a:\downloads\presser\.agents\explorer_survey_1
- Original parent: 90103355-de5f-41b6-bc1c-94f0e252b3f9
- Milestone: Explorer Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Never modify any code or run disruptive commands
- Only write metadata to own folder: a:\downloads\presser\.agents\explorer_survey_1

## Current Parent
- Conversation ID: 90103355-de5f-41b6-bc1c-94f0e252b3f9
- Updated: 2026-09-10T14:59:39Z

## Investigation State
- **Explored paths**:
  - `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`
  - `index.html`, `inline_assets.cjs`, `vercel.json`, `.oxlintrc.json`
  - `src/main.tsx`, `src/App.tsx`, `src/Checkout.tsx`, `src/AdminDashboard.tsx`, `src/api.ts`
  - `src/components/ProductScene.tsx`, `Pwh.tsx`, `TabModel.tsx`
  - `src/AlignmentTool.tsx`, `src/AnimationStudio.tsx`, `src/App.css`, `src/index.css`
  - `src/assets/`, `public/`, `dist/`, `backend/`
- **Key findings**:
  - Build & Bundler: Vite 8 + React 19 + Tailwind v4 + `vite-plugin-singlefile`. Singlefile inlines all JS/CSS into `dist/index.html` (1.37 MB).
  - Tests: Complete absence of test frameworks, test scripts, or frontend unit tests. Vitest + testing-library needed.
  - Routing: Primitive, unreactive `window.location.pathname` conditional in `main.tsx` and full page reload navigation via `window.location.href`. React Router not yet installed.
  - Assets & Bundle: `public/tab.glb` is 34.05 MB (redundant with `tab-v1.glb` 4.28 MB). `dist/` is 39.93 MB. Local loading without CDN. Drei HDRI loads from raw.githack.com.
  - Code Hygiene: Dead code in `App.css`, unlinked studio tools (`AlignmentTool`, `AnimationStudio`), unused template assets in `src/assets/`, unused dependencies (`@react-three/postprocessing`, `@studio-freight/lenis`, `lenis`).
- **Unexplored areas**: None within survey scope; all 5 scope requirements thoroughly mapped.

## Key Decisions Made
- Documented baseline metrics, file tree, entry points, dependency tree, and optimization levers in `handoff.md`.

## Artifact Index
- a:\downloads\presser\.agents\explorer_survey_1\DISPATCH.md — Received dispatch message
- a:\downloads\presser\.agents\explorer_survey_1\BRIEFING.md — Situational awareness
- a:\downloads\presser\.agents\explorer_survey_1\progress.md — Liveness heartbeat
- a:\downloads\presser\.agents\explorer_survey_1\handoff.md — Final survey report
