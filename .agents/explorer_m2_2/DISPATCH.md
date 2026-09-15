## 2026-09-10T15:32:00Z
You are Explorer M2-2 (explorer_m2_2) for Milestone 2: React Router, Tutorial Modal, Motion & ARIA.
Your working directory is: a:\downloads\presser\.agents\explorer_m2_2
Project root: a:\downloads\presser
Authoritative request: a:\downloads\presser\.agents\ORIGINAL_REQUEST.md (MUST read first)
Project plan: a:\downloads\presser\PROJECT.md (MUST read first)

Scope:
Investigate Feature F8 (Tutorial Modal):
1. Inspect `src/App.tsx` lines where the "Watch the tutorial" button is located.
2. Design the `TutorialModal` component:
   - Must be fully accessible: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap on Tab/Shift-Tab, Escape key dismissal, backdrop click dismissal, and background scroll lock.
   - Content: Multi-step installation walkthrough for attaching Presser to standard RO water filter taps.
3. Determine how to wire `isTutorialOpen` state and trigger into `src/App.tsx`.
Write your findings to `a:\downloads\presser\.agents\explorer_m2_2\handoff.md` and notify parent.
