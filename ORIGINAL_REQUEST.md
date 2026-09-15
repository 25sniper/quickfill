# Original User Request

## 2026-09-10T14:57:41Z

# Teamwork Project Prompt — Draft

> Status: Step 1 — Eliciting project idea
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

**Project description**: Improve the Presser frontend UI/UX, accessibility, performance, and code quality as per the critique, then run automated tests using a multi‑agent team to verify the changes.

Working directory: [TBD]

## Requirements

### R1. Visual & UI improvements
- Apply a centralized colour theme, extract repeated Tailwind classes, add loading spinners, and improve typography hierarchy.

### R2. Interaction & UX refinements
- Replace hard‑coded navigation with React Router, wire tutorial button to a modal, and respect reduced‑motion preferences.

### R3. Accessibility upgrades
- Add ARIA labels, focus rings, and ensure colour contrast meets WCAG AA.

### R4. Performance optimisations
- Lazy‑load the 3‑D scene, memoise keyframe evaluation, move large assets to CDN, and introduce frustum culling.

### R5. Code quality & maintainability
- Remove magic numbers into constants, split `ProductScene.tsx` into logical modules, add TypeScript typings, and create basic unit tests.

### R6. Project structure & asset management
- Relocate large static assets to CDN, introduce `src/assets/`, and add documentation.

## Acceptance Criteria

- [ ] All UI components use the new colour theme and have focus rings.
- [ ] Navigation works via React Router without full page reload.
- [ ] No colour‑contrast warnings in Lighthouse.
- [ ] Bundle size reduced by at least 10 % (measure with `npm run build`).
- [ ] Unit tests for `App` and `ProductScene` pass.
- [ ] Large assets are served from the CDN URL.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
