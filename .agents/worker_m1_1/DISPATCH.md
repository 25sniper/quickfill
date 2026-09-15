## 2026-09-10T15:10:46Z
You are Worker M1-1 (worker_m1_1) executing Milestone 1: Design System, Theme Tokens & Accessibility Primitives for the Presser frontend overhaul.
Your working directory is: a:\downloads\presser\.agents\worker_m1_1
Project workspace root: a:\downloads\presser

Mandatory References to Read:
1. a:\downloads\presser\.agents\ORIGINAL_REQUEST.md (You MUST read this first)
2. a:\downloads\presser\PROJECT.md
3. Explorer 1 findings: a:\downloads\presser\.agents\explorer_m1_1\handoff.md
4. Explorer 2 findings: a:\downloads\presser\.agents\explorer_m1_2\handoff.md
5. Explorer 3 findings: a:\downloads\presser\.agents\explorer_m1_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Tasks:
1. Centralized Color Theme & Tokens (F1):
   - Update `src/index.css` with a Tailwind CSS v4 `@theme` block defining semantic tokens: `--color-background`, `--color-surface`, `--color-surface-elevated`, `--color-border-subtle`, `--color-border-focus`, `--color-text-primary`, `--color-text-muted`, `--color-accent-*`.
   - Delete orphaned `src/App.css`.
2. Reusable UI Primitives (F2 & F3):
   - Implement `src/components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`, `Spinner.tsx`, and `index.ts` following the blueprints from `explorer_m1_2/handoff.md`.
   - Ensure every interactive element features high-contrast visible focus rings: `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none`.
   - Implement `src/components/scene/ProductSceneFallback.tsx` following `explorer_m1_3/handoff.md`.
3. WCAG AA Color Contrast Remediation (F4):
   - Replace low-contrast `#525252` and `#737373` text with `#a3a3a3` (text-neutral-400 / text-muted) to achieve >=4.5:1 contrast across `App.tsx`, `Checkout.tsx`, and `AdminDashboard.tsx`.
   - Ensure input and container borders achieve >=3.0:1 contrast against dark surfaces.
4. Typography Hierarchy Standardization (F5):
   - Standardize heading scale across `App.tsx`, `Checkout.tsx`, and `AdminDashboard.tsx` per `explorer_m1_3/handoff.md`.
   - Ensure `Checkout.tsx` confirmation screen has an accessible H1 heading.
5. Loading Spinners (F6):
   - In `App.tsx:34`, replace `fallback={null}` with `<ProductSceneFallback />`.
   - In `AdminDashboard.tsx:160`, show a loading spinner when `loading && orders.length === 0`.
   - In `AdminDashboard.tsx:68`, show an inline spinner and disable `<select>` during order status updates.
   - In `Checkout.tsx:131`, show an accessible loading spinner during form submission and photo uploads.
6. Refactor Repeated Patterns:
   - Use the new UI primitives (`Button`, `Input`, `Card`, `Spinner`) across `App.tsx`, `Checkout.tsx`, and `AdminDashboard.tsx`.

Verification Requirements:
- Run `npm run build` or `npx tsc -b` to verify 0 TypeScript errors and clean compilation.
- Document exact verification commands and results in `a:\downloads\presser\.agents\worker_m1_1\handoff.md`.
- When complete, send a message to parent orchestrator with summary and handoff path.
