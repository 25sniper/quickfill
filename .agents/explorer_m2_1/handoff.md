# Feature F7 Investigation & Implementation Plan: React Router Navigation

**Investigator**: Explorer M2-1 (`explorer_m2_1`)  
**Milestone**: Milestone 2: React Router, Tutorial Modal, Motion & ARIA  
**Date**: 2026-09-10  
**Status**: Investigation Complete — Ready for Implementation  

---

## 1. Observation

### 1.1 `package.json` Dependency Status
Inspection of `a:\downloads\presser\package.json` (lines 14-25):
```json
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
  }
```
- Neither `react-router-dom` nor `@types/react-router-dom` are installed in `package.json` or `node_modules`.
- Command execution `npm list react-router-dom` returned:
  ```
  temp_vite@0.0.0 A:\downloads\presser
  `-- (empty)
  Exit code: 1
  ```
- Command execution `npm view react-router-dom version peerDependencies`:
  ```
  version = '7.18.3'
  peerDependencies = { react: '>=18', 'react-dom': '>=18' }
  ```
  React Router v7 (`7.18.3`) is fully compatible with the project's React 19 (`^19.2.8`) peer dependency requirements and includes built-in TypeScript definitions.

### 1.2 Current Entry Point Routing in `src/main.tsx`
Inspection of `a:\downloads\presser\src\main.tsx` (lines 8-16):
```tsx
const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/checkout'? <Checkout />         :
     path === '/admin'   ? <AdminDashboard />   :
     <App />}
  </StrictMode>,
)
```
- `path` is evaluated synchronously once at bootstrap (`const path = window.location.pathname`).
- No reactive router or history listener exists.
- The only way to switch views in the current setup is a hard browser navigation reload (`window.location.href`), forcing a full page reload, tearing down React and Three.js WebGL contexts.

### 1.3 Hardcoded Navigation Call Sites
Grep search across `src/` for `window.location` and `href` identified four internal navigation call sites:

1. **`src/App.tsx` Line 28** (Fixed Header CTA):
   ```tsx
   <Button 
     variant="primary"
     size="md"
     onClick={() => window.location.href = '/checkout'}
     className="pointer-events-auto shadow-lg"
     leftIcon={<ShoppingCart className="w-4 h-4" aria-hidden="true" />}
   >
     Preorder
   </Button>
   ```

2. **`src/App.tsx` Line 143** (Bottom Conversion CTA):
   ```tsx
   <Button 
     variant="primary"
     size="lg"
     onClick={() => window.location.href = '/checkout'}
     className="mx-auto pointer-events-auto"
     leftIcon={<ShoppingCart className="w-6 h-6" aria-hidden="true" />}
   >
     Preorder Now - $19.99
   </Button>
   ```

3. **`src/Checkout.tsx` Line 57** (Order Confirmation Success Screen):
   ```tsx
   <Button 
     variant="primary"
     size="md"
     onClick={() => window.location.href = '/'}
     className="mt-6"
   >
     Return Home
   </Button>
   ```

4. **`src/Checkout.tsx` Line 73** (Header Back Button):
   ```tsx
   <Button 
     variant="ghost"
     size="sm"
     onClick={() => window.location.href = '/'}
     leftIcon={<ArrowLeft className="w-5 h-5" aria-hidden="true" />}
   >
     Back
   </Button>
   ```

*(Note: In `src/AdminDashboard.tsx` Line 223, `<a href={`${BASE_URL}/${order.custom_photo...}`}>` is an external file download/preview link and must remain a standard anchor tag.)*

### 1.4 E2E Test Suite Expectations
Analysis of `tests/e2e/tier1-feature-coverage/f07-router.test.mjs`:
- Tests `F7-1` to `F7-4`: Read `src/main.tsx` and `src/routes.tsx`. Expect `/checkout`, `/admin`, `App`, `Checkout`, `AdminDashboard` to be present in `combined` string.
- Test `F7-5`: Verifies `main.tsx` exists and retains `document.getElementById('root')`.
- Test `tests/e2e/tier1-feature-coverage/f18-project-cleanup.test.mjs` line 33-37: Verifies `main.tsx` imports `index.css` and does NOT import `App.css`.
- Test `tests/e2e/tier2-boundary-corner/f07-f10-nav-accessibility-boundaries.test.mjs`:
  - `F7-B1`: Trailing slash normalization (`/checkout/` -> `/checkout`).
  - `F7-B2`: Unrecognized 404 routes fall back gracefully to Home view (`App`).
  - `F7-B3` & `F7-B4`: Preservation of query parameters (`?ref=...`) and hash fragments (`#...`).
- Test `tests/e2e/tier3-cross-feature/navigation-modal-focus-combos.test.mjs`:
  - `Combo 3`: Route transition to `/checkout` automatically unmounts open modal in `App`.

---

## 2. Logic Chain

1. **Package Requirement**:
   - `react-router-dom` is missing from `package.json` (Obs 1.1).
   - Installing `react-router-dom` (`npm i react-router-dom`) adds the package to dependencies and provides `BrowserRouter`, `Routes`, `Route`, `useNavigate`, and `Link` with native TypeScript definitions.

2. **Routing Architecture**:
   - `PROJECT.md` Section 4 designates `src/routes.tsx` & `src/main.tsx` as the routing contract (Obs 1.4).
   - `f07-router.test.mjs` specifically inspects `src/routes.tsx` along with `src/main.tsx` (Obs 1.4).
   - Creating `src/routes.tsx` housing `<Routes>` and `<Route>` cleanly separates route table definitions from the DOM mounting logic in `src/main.tsx`.
   - Wrapping `<AppRoutes />` with `<BrowserRouter>` in `src/main.tsx` provides client-side history navigation without full page reloads.

3. **Fallback & Boundary Compliance**:
   - Including `<Route path="*" element={<App />} />` ensures any unknown paths (e.g. `/404`, `/unknown-page`) render the Home view without crashing, satisfying `F7-B2` (Obs 1.4).
   - `react-router-dom` natively handles query strings and hash anchors across client-side transitions, satisfying `F7-B3` and `F7-B4`.

4. **Navigation Call Sites & Seamless Transitions**:
   - Currently, clicking "Preorder", "Return Home", or "Back" sets `window.location.href`, triggering a full browser document reload (Obs 1.3).
   - Reusable `Button` (`src/components/ui/Button.tsx`) accepts standard `onClick` callbacks.
   - Calling `navigate = useNavigate()` and invoking `onClick={() => navigate('/checkout')}` and `onClick={() => navigate('/')}` updates browser history via the HTML5 History API (`pushState`).
   - This eliminates page flashing, prevents network re-fetching of assets, preserves WebGL scene stability, and cleanly unmounts route components (e.g. unmounting `TutorialModal` when navigating from `/` to `/checkout`).

---

## 3. Caveats

1. **Read-Only Scope**: Explorer M2-1 has conducted investigation and test validation only; no source files have been modified.
2. **Peer Feature Integration (F8 Tutorial Modal)**:
   - When Explorer/Implementer M2-2 integrates `TutorialModal` into `App.tsx`, route transitions from `App.tsx` to `Checkout.tsx` will naturally unmount `App` and therefore unmount the modal.
   - `useNavigate()` in `App.tsx` will not interfere with modal trigger buttons.
3. **Vite Single-File Plugin**:
   - `vite-plugin-singlefile` is configured in `vite.config.ts`. React Router's `BrowserRouter` is fully compatible with Vite dev server and single-page builds since all routes resolve to `index.html`.

---

## 4. Conclusion & Implementation Plan

### Step-by-Step Implementation Instructions for Implementer

#### Step 1: Install `react-router-dom`
Run the command:
```powershell
npm install react-router-dom
```
This updates `package.json` dependencies and `package-lock.json`.

#### Step 2: Create `src/routes.tsx`
Create `src/routes.tsx` with routes for `/`, `/checkout`, `/admin`, and wild-card fallback `*`:
```tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import App from './App'
import Checkout from './Checkout'
import AdminDashboard from './AdminDashboard'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/admin" element={<AdminDashboard />} />
      {/* 404 Fallback to Home as per F7-B2 */}
      <Route path="*" element={<App />} />
    </Routes>
  )
}

export default AppRoutes
```

#### Step 3: Update `src/main.tsx`
Replace current ternary logic with `BrowserRouter` and `AppRoutes`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRoutes } from './routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
```

#### Step 4: Update `src/App.tsx`
1. Import `useNavigate` from `react-router-dom`:
   ```tsx
   import { useNavigate } from 'react-router-dom'
   ```
2. Initialize `navigate` inside `App`:
   ```tsx
   const navigate = useNavigate()
   ```
3. Update Header preorder button (line 28):
   ```tsx
   // Before:
   onClick={() => window.location.href = '/checkout'}

   // After:
   onClick={() => navigate('/checkout')}
   ```
4. Update Bottom CTA preorder button (line 143):
   ```tsx
   // Before:
   onClick={() => window.location.href = '/checkout'}

   // After:
   onClick={() => navigate('/checkout')}
   ```

#### Step 5: Update `src/Checkout.tsx`
1. Import `useNavigate` from `react-router-dom`:
   ```tsx
   import { useNavigate } from 'react-router-dom'
   ```
2. Initialize `navigate` inside `Checkout`:
   ```tsx
   const navigate = useNavigate()
   ```
3. Update Return Home button on confirmation screen (line 57):
   ```tsx
   // Before:
   onClick={() => window.location.href = '/'}

   // After:
   onClick={() => navigate('/')}
   ```
4. Update Back button in header (line 73):
   ```tsx
   // Before:
   onClick={() => window.location.href = '/'}

   // After:
   onClick={() => navigate('/')}
   ```

---

## 5. Verification Method

### Automated Tests
1. Run the full test suite:
   ```powershell
   npm test
   ```
   **Expected**: 276/276 tests pass, including:
   - `Tier 1 - F7: React Router Navigation` (5/5 passing)
   - `Tier 2 - Navigation & Accessibility Boundaries (F7-F10)` (20/20 passing)
   - `Tier 3 - Navigation, Modal & Focus Combinations` (5/5 passing)
   - `Tier 4 - Complete Preorder Checkout Flow` (5/5 passing)

2. Run TypeScript compilation and production build:
   ```powershell
   npm run build
   ```
   **Expected**: Build succeeds with zero TypeScript errors or missing imports (`tsc -b && vite build`).

3. Run linter:
   ```powershell
   npm run lint
   ```
   **Expected**: Clean lint check with 0 errors.

### Manual Verification
1. Start dev server: `npm run dev`.
2. Open `http://localhost:5173/`.
3. Click "Preorder" in the top header. Verify that the URL updates to `http://localhost:5173/checkout` smoothly without any page flash or network reload of `index.html`.
4. Click "Back" in Checkout header. Verify the app navigates back to `/` instantly.
5. In Checkout, complete order to see confirmation screen, then click "Return Home". Verify instant transition to `/`.
6. Visit `http://localhost:5173/unknown-path` directly. Verify it gracefully displays the Home landing page (`App`) per `F7-B2`.

### Invalidation Conditions
- Any occurrence of `window.location.href` triggering full browser document refresh for internal routes (`/`, `/checkout`).
- Failure of `f07-router.test.mjs` due to missing `/checkout`, `/admin`, `App`, `Checkout`, or `AdminDashboard` in `src/main.tsx` or `src/routes.tsx`.
- TypeScript errors resolving `react-router-dom` imports.
