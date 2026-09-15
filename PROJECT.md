# Project: Presser Frontend Modernization & Overhaul

## Architecture
The Presser frontend is a Vite + React 19 + TypeScript single-page application showcasing an ergonomic RO faucet attachment (Presser) via an interactive 3D WebGL experience (React Three Fiber / Three.js), a checkout preorder flow, and an administrative order management dashboard.

### Core Architectural Layers:
1. **Presentation & UI Primitives**: Centralized design system using Tailwind CSS v4 `@theme` tokens, reusable accessible components (Button, Input, Card, Modal, Spinner) with consistent typography, WCAG AA compliant contrast (>=4.5:1 text, >=3.0:1 UI boundaries), and visible focus rings (`focus-visible:ring-2`).
2. **Routing & Navigation**: Client-side single-page routing using `react-router-dom` with routes for Home (`/`), Preorder Checkout (`/checkout`), and Admin Dashboard (`/admin`), preserving React state and WebGL context across transitions.
3. **3D Interactive Scene**: Modularized React Three Fiber scene under `src/components/scene/`, featuring lazy-loaded canvas, pre-sorted and memoized keyframe animation evaluation in `useFrame`, frustum culling, visibility toggling, reduced-motion adaptation, and strongly typed Three.js object models.
4. **Asset & CDN Architecture**: Remote CDN asset resolution for heavy 3D GLB models (`tab-v1.glb`, `pwh.glb`), removal of unreferenced assets (`tab.glb` 34MB), structured `src/assets/`, and Vite code-splitting to reduce bundle/distribution size by >90%.
5. **Testing & QA**: Comprehensive Vitest + React Testing Library unit test suite for components and 3D math, alongside an opaque-box E2E test harness covering all functional tiers.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Centralized Color Theme | Define `@theme` design tokens in `src/index.css` for semantic colors (primary, surface, border, text, muted, accent) | M1 | R1 |
| F2 | Extract Repeated Tailwind Classes | Centralize repeated button, input, label, and card styles into reusable UI components/primitives | M1 | R1 |
| F3 | Accessible Focus Rings | Implement high-visibility 3:1 contrast focus rings (`focus-visible:ring-2`) on all interactive controls | M1 | R3 |
| F4 | WCAG AA Color Contrast | Remediate `#525252` and `#737373` text and low-contrast borders to satisfy WCAG AA >=4.5:1 text and >=3:1 non-text | M1 | R3 |
| F5 | Typography Hierarchy | Standardize heading scale (H1, H2, H3) and responsive line heights across landing, checkout, and admin pages | M1 | R1 |
| F6 | Loading Spinners | Add accessible loading spinners for 3D scene loading, admin orders fetching, status changes, and photo uploads | M1 | R1, R3 |
| F7 | React Router Navigation | Install and configure `react-router-dom` for `/`, `/checkout`, `/admin`; eliminate `window.location.href` reloads | M2 | R2 |
| F8 | Tutorial Modal | Build accessible `TutorialModal` component wired to "Watch the tutorial" button with focus trap, ESC listener, backdrop dismiss | M2 | R2 |
| F9 | Reduced-Motion Preferences | Integrate `prefers-reduced-motion` to bypass Framer Motion animations and dampen/disable 3D rotational spinning | M2 | R2 |
| F10 | ARIA Accessibility Audit | Add `aria-label`, `aria-hidden`, label-input associations, table captions/headers, and live alerts across all views | M2 | R3 |
| F11 | Modularize `ProductScene.tsx` | Split 278-line monolith into sub-modules under `src/components/scene/` (`types`, `constants`, `animation`, `Lighting`, `Models`) | M3 | R5 |
| F12 | Extract Magic Numbers | Centralize camera, lighting, damping, and spline parameters into `constants.ts` | M3 | R5 |
| F13 | Memoize Keyframe Evaluation | Pre-sort keyframes, eliminate allocations inside `useFrame`, cache results when scroll is unchanged | M3 | R4 |
| F14 | Frustum Culling & Visibility | Set `visible = false` on off-screen 3D models (e.g. `TutorialTap`), ensure `frustumCulled = true`, recompute bounds | M3 | R4 |
| F15 | TypeScript Typings | Eliminate `any` in GLTF traversals and catch blocks; add strict interfaces for keyframes and props | M3 | R5 |
| F16 | CDN Asset Relocation | Serve large GLB models (`tab-v1.glb`, `pwh.glb`) from CDN URL; remove unused 34MB `tab.glb` | M4 | R4, R6 |
| F17 | Lazy-Load 3D Scene & Code Splitting | Lazy-load `ProductScene` via `React.lazy()` with Suspense fallback; configure Vite chunking to reduce bundle size by >10% | M4 | R4 |
| F18 | Project Cleanup & Asset Structure | Restructure `src/assets/`, remove orphan `App.css`, remove unused packages (`lenis`, `@react-three/postprocessing`) | M4 | R6 |
| F19 | Architecture Documentation | Update documentation (`README.md` and `docs/`) with architecture, styling, and 3D scene guide | M4 | R6 |
| F20 | Unit Test Suite Integration | Setup Vitest + RTL + jsdom, implement unit tests for `App`, `ProductScene`, keyframe math, routing, and UI | M5 | R5 |
| F21 | E2E Test Suite Pass (Tiers 1-4) | Pass 100% of opaque-box E2E test cases created by the E2E Testing Track | M6 | Acceptance |
| F22 | Adversarial Coverage Hardening (Tier 5) | White-box edge-case and stress verification via Challenger to harden test coverage | M6 | Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System, Theme Tokens & Accessibility Primitives | F1, F2, F3, F4, F5, F6 | none | DONE |
| M2 | React Router, Tutorial Modal, Motion & ARIA | F7, F8, F9, F10 | M1 | IN_PROGRESS |
| M3 | 3D Scene Modularization, Typings & Performance | F11, F12, F13, F14, F15 | none | PLANNED |
| M4 | Asset CDN Pipeline, Bundler Optimization & Cleanup | F16, F17, F18, F19 | M1, M3 | PLANNED |
| M5 | Unit Test Suite Integration | F20 | M1, M2, M3, M4 | PLANNED |
| M6 | Final Milestone: E2E Test Suite Pass & Adversarial Hardening | F21, F22 | M1-M5, E2E Track | PLANNED |

*Note on parallelization*: M1 (Design System & UI) and M3 (3D Scene Modularization & Performance) have disjoint file ownership and can be worked concurrently!

---

## Interface Contracts

### 1. Design System & UI Primitives (`src/components/ui/`)
- `Button`: `({ variant?: 'primary' | 'secondary' | 'ghost', size?: 'sm' | 'md' | 'lg', isLoading?: boolean, children, ...props }: ButtonProps) => JSX.Element`
- `Input`: `({ label?: string, error?: string, id: string, ...props }: InputProps) => JSX.Element`
- `Card`: `({ variant?: 'default' | 'elevated', children, className }: CardProps) => JSX.Element`
- `Spinner`: `({ size?: 'sm' | 'md' | 'lg', className, label?: string }: SpinnerProps) => JSX.Element`
- `Modal`: `({ isOpen: boolean, onClose: () => void, title: string, children }: ModalProps) => JSX.Element`

### 2. Scene Architecture (`src/components/scene/`)
- `ProductScene`: `React.FC<{ className?: string }>` (default export, lazy-loadable)
- `SceneFallback`: `React.FC` (accessible spinner fallback during 3D asset fetch)
- `evalAtMemoized`: `(kfs: Keyframe[], t: number) => MotionState` (pre-sorted, cached, 0 per-frame heap allocations)
- `constants.ts`: Exports `TUTORIAL_START`, `TUTORIAL_END`, `CAMERA_CONFIG`, `LIGHTING_CONFIG`, `ANIMATION_CONFIG`.
- `types.ts`: `Keyframe`, `MotionState`, `SceneProps`, `ModelProps`.

### 3. Asset & CDN Resolution (`src/utils/cdn.ts`)
- `getAssetUrl(path: string): string` — resolves remote CDN URL when configured via `import.meta.env.VITE_CDN_URL`, otherwise falls back gracefully to local asset.

### 4. Routing Contracts (`src/routes.tsx` & `src/main.tsx`)
- Routes: `/` -> `App`, `/checkout` -> `Checkout`, `/admin` -> `AdminDashboard`.
- Navigation via `Link` or `useNavigate()` hook from `react-router-dom`.

---

## Code Layout
```
a:\downloads\presser\
├── public\
│   ├── favicon.svg
│   └── pwh.glb                 (Local fallback)
├── src\
│   ├── assets\                 (Organized static icons and images)
│   ├── components\
│   │   ├── scene\              (Modular 3D components)
│   │   │   ├── CameraController.tsx
│   │   │   ├── Lighting.tsx
│   │   │   ├── PresserModel.tsx
│   │   │   ├── ProductScene.tsx
│   │   │   ├── ProductSceneFallback.tsx
│   │   │   ├── TapModel.tsx
│   │   │   ├── TutorialTap.tsx
│   │   │   ├── animation.ts
│   │   │   ├── constants.ts
│   │   │   └── types.ts
│   │   └── ui\                 (Reusable UI primitives)
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Spinner.tsx
│   ├── hooks\
│   │   └── useReducedMotion.ts
│   ├── utils\
│   │   └── cdn.ts
│   ├── AdminDashboard.tsx
│   ├── App.tsx
│   ├── Checkout.tsx
│   ├── api.ts
│   ├── index.css               (Tailwind v4 @theme tokens)
│   └── main.tsx                (React Router setup)
├── tests\                      (E2E and unit test specifications)
├── docs\                       (Architecture & developer guides)
└── vite.config.ts
```
