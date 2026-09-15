# Project Architecture, Tooling, and Repository Layout Survey Report

**Author**: Explorer 1 (`explorer_survey_1`)  
**Target Path**: `a:\downloads\presser\.agents\explorer_survey_1\handoff.md`  
**Date**: 2026-09-10  
**Scope**: Project architecture, dependencies, build/test tooling, bundle baseline, repository layout, routing, entry points, and CDN/asset references.

---

## 1. Observation

### 1.1 `package.json`, Build Scripts, and Dependencies
From `a:\downloads\presser\package.json` (lines 1-38):
```json
{
  "name": "temp_vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "@react-three/postprocessing": "^3.1.1",
    "@studio-freight/lenis": "^1.0.42",
    "framer-motion": "^13.2.0",
    "lenis": "^1.3.26",
    "lucide-react": "^1.39.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "three": "^0.185.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "autoprefixer": "^10.5.4",
    "oxlint": "^1.79.0",
    "postcss": "^8.5.26",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.2",
    "vite": "^8.2.2",
    "vite-plugin-singlefile": "^2.3.3"
  }
}
```
Direct observations:
- **Build Scripts**: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"lint": "oxlint"`, `"preview": "vite preview"`. There are **no test scripts** (no `npm test`), no typecheck-only script, no format script, and no clean script.
- **Unused Dependencies**:
  - `@react-three/postprocessing` is listed in `dependencies` (line 15) but searching `src/` for `postprocessing` returns 0 results.
  - `@studio-freight/lenis` (line 16) and `lenis` (line 18) are both installed, representing duplicate smooth-scrolling libraries, but searching `src/` for `lenis` returns 0 occurrences.
- **Missing Dependencies**:
  - `react-router` / `react-router-dom` is **not installed** despite client-side routing requirement R2.
  - Testing libraries (`vitest`, `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) are **not installed**.
- **DevDependencies**:
  - Tailwind CSS v4 (`tailwindcss: ^4.3.3`, `@tailwindcss/vite: ^4.3.3`). Redundant `postcss: ^8.5.26` and `autoprefixer: ^10.5.4` remain from earlier templates.
  - `vite-plugin-singlefile: ^2.3.3` is installed and active.

### 1.2 Bundler Configuration (`vite.config.ts`)
From `a:\downloads\presser\vite.config.ts` (lines 1-10):
```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
})
```
Direct observations:
- `viteSingleFile()` plugin is explicitly loaded in line 8. This plugin bundles all scripts and CSS into an inline single file (`dist/index.html`).
- No code splitting, manual chunking, or asset optimization plugins are configured.

### 1.3 TypeScript Configuration
From `a:\downloads\presser\tsconfig.json` (lines 1-8):
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```
From `a:\downloads\presser\tsconfig.app.json` (lines 1-26):
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```
From `a:\downloads\presser\src\vite-env.d.ts` (lines 1-5):
```ts
declare module '*.glb' {
  const src: string;
  export default src;
}
```
Direct observations:
- Strict compiler options include `verbatimModuleSyntax: true`, `noUnusedLocals: true`, and `noUnusedParameters: true`.
- Module resolution is `"bundler"`.
- `include` is restricted to `["src"]`.
- `vite-env.d.ts` only declares `*.glb`.

### 1.4 Test Setup Inspection
- **Test Framework in `package.json`**: None. Neither `jest` nor `vitest` nor `@testing-library` exists in `dependencies` or `devDependencies`.
- **Search for test files in `src/`**: Searching for `*test*` and `*spec*` in `src/` returns 0 files.
- **Backend tests**: Backend tests exist in `backend/test_api.py` (1,047 bytes) and `backend/test_flask_api.py` (3,049 bytes) using Python `unittest`/`pytest`, but there are no frontend tests.

### 1.5 Bundle Size Baseline and Output Inspection
Inspection of `dist/` directory:
| File | Size (Bytes) | Size (Human Readable) | Description |
|---|---|---|---|
| `dist/index.html` | 1,370,928 | ~1.31 MiB (1.37 MB) | Singlefile bundle inlining all JS (Three.js, React, R3F, Framer Motion) and CSS |
| `dist/tab.glb` | 34,053,864 | ~32.48 MiB (34.05 MB) | High-poly dispenser tap model copied from `public/tab.glb` |
| `dist/tab-v1.glb` | 4,283,540 | ~4.08 MiB (4.28 MB) | Reduced dispenser tap model copied from `public/tab-v1.glb` |
| `dist/pwh.glb` | 206,812 | ~201.96 KiB (206.8 KB) | Presser attachment model copied from `public/pwh.glb` |
| `dist/favicon.svg` | 9,522 | ~9.30 KiB (9.5 KB) | Browser icon |
| `dist/icons.svg` | 5,031 | ~4.91 KiB (5.0 KB) | Unused icon sprite |
| **Total `dist/` Directory** | **39,929,697** | **~38.08 MiB (39.93 MB)** | **Complete current build output** |

Standalone artifact inspection:
- `presser_standalone.html`: 47,124,737 bytes (~44.94 MiB / 47.12 MB), generated by `inline_assets.cjs` by converting `pwh.glb` and `tab.glb` to base64 Data URIs and replacing `/pwh.glb` and `/tab.glb` references.

### 1.6 File Tree and Component Mapping
Full tree of `a:\downloads\presser`:
```
a:\downloads\presser\
├── .agents\
│   ├── ORIGINAL_REQUEST.md
│   └── explorer_survey_1\
│       ├── BRIEFING.md
│       ├── DISPATCH.md
│       ├── progress.md
│       └── handoff.md
├── backend\               (Flask/Python backend service)
│   ├── app.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── orders.db
│   ├── requirements.txt
│   ├── schemas.py
│   ├── test_api.py
│   ├── test_flask_api.py
│   ├── wsgi.py
│   └── uploads\
├── dist\                  (Existing build output; 39.93 MB)
│   ├── favicon.svg
│   ├── icons.svg
│   ├── index.html
│   ├── pwh.glb
│   ├── tab-v1.glb
│   └── tab.glb
├── public\                (Public root assets; 38.56 MB)
│   ├── favicon.svg        (9.5 KB)
│   ├── icons.svg          (5.0 KB - unused)
│   ├── pwh.glb            (206.8 KB - Presser GLB model)
│   ├── tab-v1.glb         (4.28 MB - Dispenser tap v1 GLB model)
│   └── tab.glb            (34.05 MB - Raw dispenser tap GLB model, unused by active components)
├── src\
│   ├── assets\            (Asset folder; 25.9 KB)
│   │   ├── hero.png       (13.1 KB - unused)
│   │   ├── react.svg      (4.1 KB - unused)
│   │   └── vite.svg       (8.7 KB - unused)
│   ├── components\        (Components directory; 18.1 KB)
│   │   ├── ProductScene.tsx (278 lines, 14.6 KB - 3D scene & animation controller)
│   │   ├── Pwh.tsx          (63 lines, 1.7 KB - Presser attachment GLB model)
│   │   └── TabModel.tsx     (62 lines, 1.8 KB - Dispenser tap model loader)
│   ├── AdminDashboard.tsx (214 lines, 8.4 KB - Admin order management UI)
│   ├── AlignmentTool.tsx  (238 lines, 11.6 KB - Standalone dev utility, unreferenced)
│   ├── AnimationStudio.tsx(667 lines, 31.4 KB - Standalone keyframe editor, unreferenced)
│   ├── api.ts             (58 lines, 1.8 KB - Backend API client)
│   ├── App.css            (185 lines, 2.9 KB - Leftover Vite boilerplate CSS, unreferenced)
│   ├── App.tsx            (148 lines, 7.4 KB - Main landing page)
│   ├── Checkout.tsx       (141 lines, 5.5 KB - Preorder form & photo upload)
│   ├── index.css          (10 lines, 127 B - Tailwind v4 entry)
│   ├── main.tsx           (17 lines, 459 B - Entry point with hardcoded path evaluation)
│   └── vite-env.d.ts      (5 lines, 70 B - TS module declaration for GLB)
├── index.html             (14 lines, 361 B - Root HTML page)
├── inline_assets.cjs      (36 lines, 1.6 KB - Utility script for standalone packaging)
├── package-lock.json      (103.7 KB)
├── package.json           (39 lines, 959 B)
├── presser_standalone.html(47.1 MB)
├── pwh.SLDPRT             (336.7 KB - CAD raw model)
├── pwh.STEP               (253.0 KB - CAD raw model)
├── pwh.STL                (657.9 KB - 3D print STL mesh)
├── tsconfig.app.json      (27 lines, 655 B)
├── tsconfig.json          (8 lines, 119 B)
├── tsconfig.node.json     (24 lines, 558 B)
├── vercel.json            (9 lines, 96 B)
├── vite.config.ts         (10 lines, 294 B)
├── .gitignore             (431 B)
├── .oxlintrc.json         (9 lines, 245 B)
└── README.md              (33 lines, 1.3 KB)
```

### 1.7 Entry Points and Routing Mechanism
- **HTML Entry Point (`index.html`)**:
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>temp_vite</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```
- **Application Entry Point (`src/main.tsx`)**:
  ```tsx
  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.tsx'
  import Checkout from './Checkout.tsx'
  import AdminDashboard from './AdminDashboard.tsx'

  const path = window.location.pathname

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {path === '/checkout'? <Checkout />         :
       path === '/admin'   ? <AdminDashboard />   :
       <App />}
    </StrictMode>,
  )
  ```
- **Navigation in `App.tsx` and `Checkout.tsx`**:
  - In `src/App.tsx` lines 24 & 132:
    `onClick={() => window.location.href = '/checkout'}`
  - In `src/Checkout.tsx` lines 50 & 64:
    `onClick={() => window.location.href = '/'}`
  - Observation: There is no client-side router (e.g. React Router); all page navigation triggers full browser page reloads.

### 1.8 CDN and Asset Hosting References
- In `src/components/ProductScene.tsx` line 223:
  `<Environment preset="warehouse" />`
  Under `@react-three/drei`, environment presets query PMNDRS's GitHub CDN:
  `https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/empty_warehouse_01_1k.hdr`
- In `src/components/Pwh.tsx` lines 6 & 62:
  `const { scene } = useGLTF('/pwh.glb')` and `useGLTF.preload('/pwh.glb')` (local path).
- In `src/components/TabModel.tsx` line 6:
  `const { scene } = useGLTF('/tab-v1.glb')` (local path).
- In `src/api.ts` line 1:
  `export const BASE_URL = import.meta.env.VITE_API_URL || ''`
- Observation: Except for Drei's automatic HDR lookup, there are **no CDN URLs configured** for the heavy static models (`tab.glb`, `tab-v1.glb`, `pwh.glb`). They are loaded as relative `/` assets served directly from `public/`.

---

## 2. Logic Chain

1. **Test Infrastructure Deficit (Observations 1.1, 1.4)**:
   - `package.json` contains no test dependencies or test scripts.
   - Requirement R5 specifies "create basic unit tests", and the Acceptance Criteria states "Unit tests for App and ProductScene pass."
   - *Inference*: Vitest must be installed alongside `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`. A `"test": "vitest run"` script must be added to `package.json`.

2. **Routing Deficit (Observations 1.1, 1.7)**:
   - `main.tsx` inspects `window.location.pathname` once at startup, and buttons use `window.location.href = '...'`.
   - Requirement R2 mandates "Replace hard-coded navigation with React Router" and Acceptance Criteria mandates "Navigation works via React Router without full page reload."
   - *Inference*: `react-router` (or `react-router-dom`) must be installed, routes declared (`/`, `/checkout`, `/admin`), and navigation replaced with `<Link>` or `useNavigate()`. `vercel.json` already contains the SPA rewrite rule (`"/(.*)" -> "/index.html"`), so routing will work in production immediately.

3. **Bundle Size Baseline & Bloat Mechanics (Observations 1.1, 1.2, 1.5)**:
   - The current `dist/` size is **39.93 MB**, dominated by:
     1. `tab.glb` (34.05 MB) in `public/` is copied into `dist/` on build even though `TabModel.tsx` imports `/tab-v1.glb` (4.28 MB).
     2. `vite-plugin-singlefile` inlines the entire JS bundle (including Three.js and R3F) into `dist/index.html` (1.37 MB).
     3. `ProductScene` is imported synchronously in `App.tsx` (`import { ProductScene } from './components/ProductScene'`), forcing all 3D libraries into the main critical bundle.
   - Requirement R4 states "Lazy-load the 3-D scene, memoise keyframe evaluation, move large assets to CDN", Requirement R6 states "Relocate large static assets to CDN", and Acceptance Criteria mandates "Bundle size reduced by at least 10 % (measure with `npm run build`)" and "Large assets are served from the CDN URL."
   - *Inference*:
     - Moving `tab.glb` (34.05 MB) and `tab-v1.glb` (4.28 MB) out of `public/` to a CDN URL will drop `dist/` size by **>95%** (from 39.93 MB to ~1.58 MB).
     - Splitting out `viteSingleFile` or lazy loading `ProductScene` (`React.lazy(() => import('./components/ProductScene'))`) will drop the initial entry bundle size significantly, easily satisfying the 10% reduction criterion.

4. **Dead Code and Cleanup Opportunities (Observations 1.1, 1.6)**:
   - `src/App.css` (185 lines) is unused boilerplate.
   - `src/assets/hero.png`, `src/assets/react.svg`, and `src/assets/vite.svg` are unreferenced.
   - `public/icons.svg` and `public/tab.glb` are unreferenced in component rendering.
   - `src/AlignmentTool.tsx` (238 lines) and `src/AnimationStudio.tsx` (667 lines) are internal developer utilities not linked to any route.
   - `@studio-freight/lenis`, `lenis`, and `@react-three/postprocessing` in `package.json` are unreferenced dependencies.
   - *Inference*: Pruning unused dependencies and files will clean repository layout, improve build times, and reduce dependency vulnerabilities.

5. **Code Quality and Architecture (Observations 1.3, 1.6, 1.8)**:
   - `ProductScene.tsx` contains 278 lines mixing keyframe interpolation (`evalAt`), keyframe data arrays (`PRESSER_KFS`, `TAP_KFS`), 3D sub-components (`TutorialTap`, `ScrollModel`), viewport camera calculations, lighting, and scroll event listeners.
   - Requirement R5 mandates "Remove magic numbers into constants, split `ProductScene.tsx` into logical modules, add TypeScript typings".
   - *Inference*: `ProductScene.tsx` can be cleanly decoupled into:
     - `keyframes.ts` (constants and interpolation helpers)
     - `ScrollModel.tsx` / `TutorialTap.tsx` (modular 3D group components)
     - `constants.ts` (scroll thresholds, damp factors, lighting parameters)
     - `ProductScene.tsx` (main scene canvas and scroll orchestration)

---

## 3. Caveats

1. **Interactive Terminal Commands**: Terminal command execution via `run_command` timed out waiting for user interactive permissions. Direct inspection via filesystem tools (`view_file`, `list_dir`, `grep_search`, `find_by_name`) was used instead to gather 100% of the data without disruption.
2. **Backend API**: The `backend/` directory contains a Python Flask API (`app.py`) for order handling. The frontend investigation confirms `src/api.ts` talks to this backend via `BASE_URL = import.meta.env.VITE_API_URL || ''`. The backend was noted for integration points (`/upload/`, `/orders/`, `/token`), but code modifications there are out of scope.
3. **CDN URL Hosting**: While the acceptance criteria require large assets to be served from a CDN URL, no external CDN endpoint is currently specified in the repo. An environment variable or configurable constant (e.g. `VITE_CDN_BASE_URL` or `ASSET_CDN_URL`) should be introduced so that assets can be fetched from a CDN or fall back to local dev serving.

---

## 4. Conclusion

The Presser frontend is an early-stage Vite + React 19 single-page application centered around a Three.js / React Three Fiber product showcase with an RO water tap attachment.

### Key Architectural Baseline Findings:
1. **Tooling & Build**: Vite 8 + React 19 + Tailwind v4 + TypeScript. Currently configured with `vite-plugin-singlefile`, creating a monolithic 1.37 MB `dist/index.html`.
2. **Test Infrastructure**: Completely missing. No test runners, test libraries, test scripts, or test files exist. Vitest + React Testing Library must be introduced.
3. **Routing**: Absent. Primitive `window.location.pathname` conditional in `main.tsx` forces full page refreshes. React Router needs to be installed and wired.
4. **Bundle Size Baseline**:
   - Total `dist/`: **39.93 MB** (dominated by `public/tab.glb` at 34.05 MB and `tab-v1.glb` at 4.28 MB).
   - Inlined JS/CSS in `dist/index.html`: **1.37 MB**.
   - Standalone base64 HTML: **47.12 MB**.
   - Clear path to >90% reduction via CDN offloading and code splitting / lazy loading of `ProductScene`.
5. **Asset & CDN Setup**: All 3D models (`pwh.glb`, `tab-v1.glb`, `tab.glb`) are served from local `public/` paths. The only remote asset call is Drei's automatic HDR environment fetch from GitHub.
6. **Dead Code & Tech Debt**:
   - `App.css` (unused boilerplate).
   - `src/assets/*` (unused boilerplate images).
   - `AlignmentTool.tsx` and `AnimationStudio.tsx` (unrouted dev tools).
   - Redundant dependencies: `lenis`, `@studio-freight/lenis`, `@react-three/postprocessing`.
   - Magic numbers throughout `ProductScene.tsx`.

---

## 5. Verification Method

To independently verify these survey findings:

1. **Verify Dependencies & Scripts**:
   - Inspect `package.json` lines 6-37 to verify lack of `"test"` script, presence of `vite-plugin-singlefile`, and duplicate `lenis` packages.
   - Command: `grep -E '"(test|vitest|jest|react-router)"' package.json` (yields no matches).
2. **Verify Build Output Sizes**:
   - Inspect `dist/` file sizes via directory listing:
     - `dist/index.html` (~1.37 MB)
     - `dist/tab.glb` (~34.05 MB)
     - `dist/tab-v1.glb` (~4.28 MB)
     - `dist/pwh.glb` (~206 KB)
     - Total: ~39.93 MB.
3. **Verify Routing & Entry Point**:
   - Inspect `src/main.tsx` lines 8-16 to confirm `const path = window.location.pathname` conditional rendering.
   - Inspect `src/App.tsx` lines 24 and 132 to confirm `window.location.href = '/checkout'`.
4. **Verify Asset Usage & CDN References**:
   - Inspect `src/components/Pwh.tsx` line 6 (`useGLTF('/pwh.glb')`).
   - Inspect `src/components/TabModel.tsx` line 6 (`useGLTF('/tab-v1.glb')`).
   - Inspect `src/components/ProductScene.tsx` line 223 (`<Environment preset="warehouse" />`).
   - Confirm `public/tab.glb` (34 MB) is never referenced in active component code (`TabModel.tsx` uses `tab-v1.glb`).
5. **Verify Dead Code**:
   - Grep `App.css` across `src/`: 0 imports.
   - Grep `postprocessing` across `src/`: 0 imports.
   - Grep `hero.png` across `src/`: 0 imports.
