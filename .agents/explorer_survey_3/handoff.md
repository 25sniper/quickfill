# Handoff Report: 3D Scene, Performance, Code Quality, and Assets Survey (R4, R5, R6)

**Agent**: Explorer 3 (`explorer_survey_3`)  
**Target Project**: Presser Frontend (`a:\downloads\presser`)  
**Authoritative Reference**: `a:\downloads\presser\.agents\ORIGINAL_REQUEST.md` (Requirements R4, R5, R6)  
**Date**: 2026-09-10  

---

## 1. Observation

### 1.1 3D Stack and Architecture
- **Dependencies (`package.json`)**:
  - `@react-three/fiber`: `^9.7.0` (React 19 compatible)
  - `@react-three/drei`: `^10.7.8`
  - `@react-three/postprocessing`: `^3.1.1` — **Zero imports across `src/`**. It is installed but completely unused dead weight.
  - `three`: `^0.185.1`
  - `react` & `react-dom`: `^19.2.8`
- **Component Hierarchy**:
  - `App.tsx`:
    - Line 4: `import { ProductScene } from './components/ProductScene'`
    - Lines 33–37:
      ```tsx
      <div className="fixed inset-0 z-40 pointer-events-none">
        <Suspense fallback={null}>
          <ProductScene />
        </Suspense>
      </div>
      ```
    - Note: Although `<Suspense>` is present, `ProductScene` is imported **statically/eagerly**. `React.lazy()` is not used.
  - `main.tsx`:
    - Lines 4–6:
      ```tsx
      import App from './App.tsx'
      import Checkout from './Checkout.tsx'
      import AdminDashboard from './AdminDashboard.tsx'
      ```
    - All routes (`App`, `Checkout`, `AdminDashboard`) are statically imported at the root. Visiting `/checkout` or `/admin` still downloads and parses Three.js, R3F, and Drei.
  - `ProductScene.tsx` (278 lines):
    - Monolith combining `KF`/`MS` interfaces, `evalAt`, `PRESSER_KFS`, `TAP_KFS`, `TutorialTap`, `ScrollModel`, `SceneContents`, and `ProductScene`.
    - Lines 267–275:
      ```tsx
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ powerPreference: 'high-performance', antialias: true }}
        dpr={[1, 1.5]}
      >
        <SceneContents scrollProgress={scrollProgress} />
      </Canvas>
      ```
    - Canvas configuration lacks `shadows` despite `<directionalLight castShadow />` at line 220.
    - Uses Drei `<Environment preset="warehouse" />` at line 223, which downloads an external 1.5–2 MB HDR (`empty_warehouse_01_1k.hdr`) from `raw.githack.com` at runtime.
    - Auto-recovers from WebGL context loss via `canvasKey` re-mounting (lines 253–263).
    - Unthrottled scroll listener on `window` (`lines 244–251`) updates React state `scrollProgress`, causing full component re-renders of `ProductScene` on every native scroll event.
- **Model Components**:
  - `Pwh.tsx` (63 lines):
    - Loads `/pwh.glb` via `useGLTF('/pwh.glb')`.
    - Line 62: `useGLTF.preload('/pwh.glb')` triggers asset fetch immediately on bundle parse.
    - Clones scene, computes bounding box, scales uniformly by `3 / maxDim`, centers with `clonedScene.position.sub(center.multiplyScalar(scale))`.
    - Replaces all mesh materials with `MeshPhysicalMaterial` (`#e0e0e0`, metalness: 0.8, roughness: 0.2, clearcoat: 1).
    - Traverses and disposes materials on unmount.
    - Does **not** set `frustumCulled = true`, nor does it recompute mesh bounding spheres after parent transformation.
  - `TabModel.tsx` (62 lines):
    - Loads `/tab-v1.glb` via `useGLTF('/tab-v1.glb')`.
    - Clones scene, normalizes scale to `3.2 / maxDim`, centers it.
    - Replaces materials with polished brass `MeshPhysicalMaterial` (`#c8a44a`, metalness: 0.95, roughness: 0.15, clearcoat: 0.8, emissive: `#3d2a00`, emissiveIntensity: 0.3).
    - Does **not** set `frustumCulled = true`.
- **Standalone Dev Tools**:
  - `src/AnimationStudio.tsx` (667 lines, 31.4 KB) and `src/AlignmentTool.tsx` (238 lines, 11.6 KB):
    - Both exist in `src/` but are **not imported anywhere** in `main.tsx` or `App.tsx`.
    - Both duplicate model loading (`/pwh.glb`, `/tab-v1.glb`), `buildMesh` logic, keyframe evaluation, and materials.

---

### 1.2 Performance & Keyframe Evaluation
- **Keyframe Evaluator in `ProductScene.tsx`**:
  ```tsx
  function evalAt(kfs: KF[], t: number): MS {
    if (!kfs.length) return { pos:[0,0,0], rot:[0,0,0], scale:1 }
    const s = [...kfs].sort((a,b) => a.t - b.t)
    if (t <= s[0].t) return { pos:[...s[0].pos], rot:[...s[0].rot], scale:s[0].scale }
    const last = s[s.length-1]
    if (t >= last.t) return { pos:[...last.pos], rot:[...last.rot], scale:last.scale }
    for (let i = 0; i < s.length-1; i++) {
      if (t >= s[i].t && t <= s[i+1].t) {
        const f = (t - s[i].t) / (s[i+1].t - s[i].t)
        const L = THREE.MathUtils.lerp
        return {
          pos: [L(s[i].pos[0],s[i+1].pos[0],f), L(s[i].pos[1],s[i+1].pos[1],f), L(s[i].pos[2],s[i+1].pos[2],f)],
          rot: [L(s[i].rot[0],s[i+1].rot[0],f), L(s[i].rot[1],s[i+1].rot[1],f), L(s[i].rot[2],s[i+1].rot[2],f)],
          scale: L(s[i].scale, s[i+1].scale, f)
        }
      }
    }
    return { pos:[...last.pos], rot:[...last.rot], scale:last.scale }
  }
  ```
  - **Invoked inside `useFrame`**:
    - `TutorialTap` (line 75): `evalAt(TAP_KFS, lT)` called every frame (60–120 fps).
    - `ScrollModel` (line 157): `evalAt(PRESSER_KFS, lT)` called every frame (60–120 fps).
  - **Deficiencies**:
    - `const s = [...kfs].sort((a,b) => a.t - b.t)` creates a new array and runs `.sort()` **twice per frame** (120–240 array allocations and sorts per second) despite `PRESSER_KFS` and `TAP_KFS` being static, pre-sorted constants.
    - Creates 3 new array allocations (`pos`, `rot`, and wrapper object) every call, driving garbage collection churn.
    - Zero memoization or caching: even when `scrollProgress` does not change, `evalAt` repeats the full computation every frame.
- **Frustum Culling & Visibility**:
  - In `TutorialTap`:
    - Lines 73–89: When `t < TUTORIAL_START || t > TUTORIAL_END`, the code executes:
      `ref.current.scale.setScalar(d(ref.current.scale.x, 0))`
    - `ref.current.visible` is never set to `false`.
    - Three.js continues processing the entire object hierarchy, computing matrix transforms, and issuing WebGL draw calls for the tap model even when it is scaled down to 0 and completely invisible.
  - Mesh geometries do not have `geometry.computeBoundingSphere()` invoked following parent group scaling, which can cause Three.js default frustum culling to miscalculate bounds.

---

### 1.3 Magic Numbers Catalogue
The following magic numbers are hard-coded in `ProductScene.tsx`, `Pwh.tsx`, and `TabModel.tsx`:

| Parameter | Location | Hardcoded Value | Intended Meaning |
|---|---|---|---|
| `TUTORIAL_START` | `ProductScene.tsx:42` | `0.33` | Scroll progress at start of tutorial |
| `TUTORIAL_END` | `ProductScene.tsx:43` | `0.88` | Scroll progress at end of tutorial |
| `TAP_DAMPING` | `ProductScene.tsx:71` | `7` | Damping lambda for tap interpolation |
| `PRESSER_DAMPING` | `ProductScene.tsx:152` | `3.5` | Damping lambda for presser interpolation |
| `IDLE_FLOAT_SPEED` | `ProductScene.tsx:172` | `0.8` | Sine wave frequency for idle float |
| `IDLE_FLOAT_AMP` | `ProductScene.tsx:172` | `0.07` | Vertical amplitude for idle float |
| `SPLINE_SEGMENTS` | `ProductScene.tsx:174` | `6` | Number of spline curve intervals |
| `HERO_POS_Z` | `ProductScene.tsx:117` | `isMobile ? 5.0 : 4.0` | Camera-relative Z depth in Hero section |
| `HERO_POS_Y` | `ProductScene.tsx:117` | `0.4` | Y offset in Hero section |
| `TESTIMONIALS_POS` | `ProductScene.tsx:118` | `[-maxX * 0.6, 0.1, isMobile ? 3.0 : 2.0]` | Position during testimonials |
| `PREORDER_POS` | `ProductScene.tsx:123` | `[0, -0.6, isMobile ? 6.0 : 7.0]` | Position during preorder section |
| `SPLINE_ROT_X` | `ProductScene.tsx:129–137` | `[2.0 - 2π, 2.0 - π, 2.0, 0, 0, 0, -0.1]` | Spline rotation keyframes (X axis) |
| `SPLINE_ROT_Y` | `ProductScene.tsx:138–146` | `[-2π, -π, 0, 0, 0, 0, π * 0.25]` | Spline rotation keyframes (Y axis) |
| `ASPECT_MOBILE_BP` | `ProductScene.tsx:200` | `0.85` | Aspect ratio breakpoint for mobile |
| `TRAVEL_BOUNDS_MOBILE` | `ProductScene.tsx:207` | `Math.min(1.4, viewport.width * 0.22)` | Max horizontal travel on mobile |
| `TRAVEL_BOUNDS_DESK` | `ProductScene.tsx:208` | `Math.min(3.2, (viewport.width / 2) - 1.2)` | Max horizontal travel on desktop |
| `FOV_MOBILE` | `ProductScene.tsx:213` | `55` | Camera FOV on mobile |
| `FOV_DESKTOP` | `ProductScene.tsx:213, 269` | `45` | Camera FOV on desktop |
| `DEFAULT_CAM_POS` | `ProductScene.tsx:269` | `[0, 0, 15]` | Canvas camera position |
| `CANVAS_DPR` | `ProductScene.tsx:271` | `[1, 1.5]` | Device pixel ratio clamp range |
| `WEBGL_RECOVERY_MS` | `ProductScene.tsx:259` | `500` | Delay to re-mount canvas after context loss |
| `LIGHT_AMBIENT` | `ProductScene.tsx:219` | `2.5` | Ambient light intensity |
| `LIGHT_DIR_KEY` | `ProductScene.tsx:220` | `pos: [8, 10, 8], int: 2.5` | Key directional light |
| `LIGHT_DIR_FILL` | `ProductScene.tsx:221` | `pos: [-6, 4, -4], int: 1.2` | Fill directional light |
| `LIGHT_DIR_RIM` | `ProductScene.tsx:222` | `pos: [0, -8, 6], int: 0.6` | Rim directional light |
| `PRESSER_NORM_SCALE` | `Pwh.tsx:17` | `3 / maxDim` | Target bounding size for presser |
| `TAP_NORM_SCALE` | `TabModel.tsx:17` | `3.2 / maxDim` | Target bounding size for tap |
| `PRESSER_MAT` | `Pwh.tsx:26–31` | `color: '#e0e0e0', metal: 0.8, rough: 0.2, cc: 1, ccRough: 0.1` | Presser PBR material properties |
| `TAP_MAT` | `TabModel.tsx:25–32` | `color: '#c8a44a', metal: 0.95, rough: 0.15, emissive: '#3d2a00', int: 0.3` | Tap PBR brass material properties |

---

### 1.4 TypeScript Typings Survey
- **`any` Occurrences**:
  - `src/components/Pwh.tsx:22`: `clonedScene.traverse((child: any) => {`
  - `src/components/Pwh.tsx:23`: `if ((child as any).isMesh) {`
  - `src/components/Pwh.tsx:42`: `scaledScene.traverse((child: any) => {`
  - `src/components/TabModel.tsx:35`: `clonedScene.traverse((child: any) => {`
  - `src/components/TabModel.tsx:47`: `clone.traverse((child: any) => {`
  - `src/Checkout.tsx:34`: `catch (err: any) {`
  - `src/AdminDashboard.tsx:56`: `catch (err: any) {`
- **Missing or Cryptic Types**:
  - Cryptic type aliases: `interface KF` and `interface MS` in `ProductScene.tsx:11–12`.
  - Missing proper component props interfaces for `ProductScene`, `SceneContents`, `ScrollModel`, `TutorialTap`, `Model` (in `Pwh.tsx`), and `TabModel`.
  - Unsafe camera casting in `ProductScene.tsx:212`: `const c = camera as THREE.PerspectiveCamera` without type guard.
  - Coordinate tuples typed as generic `[number, number, number]` instead of Three.js `[x: number, y: number, z: number]` or `THREE.Vector3Tuple`.
  - `tsconfig.app.json` has `skipLibCheck: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, but lacks `strict: true` and `noImplicitAny: true`.

---

### 1.5 Repository Asset Inventory
- **Public & Asset Files**:
  - `public/tab.glb`: **34,053,864 bytes (~34.05 MB)**. Unused original tap model. Because it is located in `public/`, Vite copies it to `dist/tab.glb` during build, causing enormous deployment bloat.
  - `public/tab-v1.glb`: **4,283,540 bytes (~4.28 MB)**. The active tap model loaded by `TabModel.tsx`. Extremely heavy for an initial page load.
  - `public/pwh.glb`: **206,812 bytes (~206.8 KB)**. Active presser model loaded by `Pwh.tsx`.
  - `presser_standalone.html`: **47,124,737 bytes (~47.12 MB)**. Output generated by `inline_assets.cjs` containing base64-inlined GLB models. Committed in repo root.
  - `pwh.SLDPRT`: **336,744 bytes (~336.7 KB)**. Raw SolidWorks CAD file sitting in project root.
  - `pwh.STEP`: **253,002 bytes (~253.0 KB)**. Raw STEP CAD file sitting in project root.
  - `pwh.STL`: **657,884 bytes (~657.9 KB)**. Raw STL 3D mesh file sitting in project root.
  - `src/assets/hero.png`: **13,057 bytes (~13.1 KB)**. Unreferenced.
  - `src/assets/react.svg`: **4,126 bytes (~4.1 KB)**. Default Vite starter asset; unreferenced.
  - `src/assets/vite.svg`: **8,709 bytes (~8.7 KB)**. Default Vite starter asset; unreferenced.
  - `public/favicon.svg`: **9,522 bytes (~9.5 KB)**. App favicon referenced by `index.html`.
  - `public/icons.svg`: **5,031 bytes (~5.0 KB)**. Unreferenced SVG sprite.
  - External Drei HDR: `https://raw.githack.com/pmndrs/drei-assets/.../empty_warehouse_01_1k.hdr` (~1.5–2 MB). Downloaded from third-party URL at runtime.
- **Vite Build Configuration (`vite.config.ts`)**:
  ```ts
  export default defineConfig({
    plugins: [react(), tailwindcss(), viteSingleFile()],
  })
  ```
  - `vite-plugin-singlefile` forces all JS, CSS, and HTML into a single monolithic `dist/index.html` (currently 1,370,928 bytes), which completely defeats standard code-splitting and dynamic `import()` chunking!

---

## 2. Logic Chain

```
[Observation 1.1: App.tsx statically imports ProductScene]
  + [Observation 1.1: main.tsx statically imports App, Checkout, AdminDashboard]
  + [Observation 1.5: viteSingleFile plugin active in vite.config.ts]
  → Logic: The 1.4 MB bundle containing Three.js, R3F, Drei, and postprocessing is downloaded and parsed immediately on every page visit (including /checkout and /admin).
  → Conclusion: The 3D scene is eagerly loaded, blocking Time-To-Interactive (TTI) and Largest Contentful Paint (LCP).

[Observation 1.2: evalAt clones array [...kfs] and runs .sort() twice every frame]
  + [Observation 1.2: Returns newly allocated pos/rot/scale objects on every frame]
  + [Observation 1.2: TAP_KFS and PRESSER_KFS are immutable constant arrays]
  → Logic: Executing array cloning and sorting at 120-240 operations/sec generates unnecessary garbage collection pauses and CPU overhead.
  → Conclusion: Keyframe evaluation must be memoized; static keyframes must be pre-sorted once; outputs should reuse memory buffers or only update when t changes.

[Observation 1.2: TutorialTap scales mesh to 0 outside tutorial range but never sets visible = false]
  + [Observation 1.1: Neither Pwh.tsx nor TabModel.tsx sets frustumCulled or recomputes geometry bounding spheres]
  → Logic: Three.js traverses the scene graph and issues draw calls for objects scaled to 0, wasting GPU fragment/vertex stages.
  → Conclusion: Explicit frustum culling and visibility toggle (visible = false) will reduce unnecessary draw calls to 0 outside active animation zones.

[Observation 1.3: 28+ magic numbers across ProductScene.tsx, Pwh.tsx, TabModel.tsx]
  + [Observation 1.1: ProductScene.tsx conflates animation, camera, lighting, models, and canvas]
  → Logic: High coupling makes unit testing, tuning visual parameters, and responsiveness difficult to maintain.
  → Conclusion: Extract constants into constants.ts and split ProductScene.tsx into modular sub-components: Model, Lighting, CameraController, and Scene.

[Observation 1.4: child: any in Pwh.tsx and TabModel.tsx; err: any in Checkout/Admin]
  + [Observation 1.4: Cryptic interfaces KF, MS; untyped component props]
  → Logic: Type safety is compromised; Three.js Object3D type guards and explicit interfaces are missing.
  → Conclusion: Introduce Keyframe, MotionState, SceneProps, and use proper THREE.Mesh type guards.

[Observation 1.5: public/tab.glb is 34.05 MB (unused duplicate of tab-v1.glb)]
  + [Observation 1.5: tab-v1.glb is 4.28 MB and pwh.glb is 206.8 KB in public/]
  + [Observation 1.5: CAD files (pwh.SLDPRT, STEP, STL) and presser_standalone.html in repo root]
  → Logic: Including 38+ MB of 3D models in public/ causes extreme repository and bundle bloat.
  → Conclusion: Remove unused tab.glb and standalone HTML; move large active models (tab-v1.glb, pwh.glb) to CDN; reorganize src/assets/.
```

---

## 3. Caveats

1. **Standalone HTML Workflow**: `inline_assets.cjs` exists to create `presser_standalone.html` for offline/portable demos. If this workflow is still required by the user, it should be isolated in a dedicated build script and its 47 MB artifact added to `.gitignore`.
2. **CDN Infrastructure**: A specific CDN bucket (AWS S3, Cloudflare R2, or Vercel Blob) is not yet configured in environment variables. We recommend introducing `VITE_CDN_URL` in `.env` with a local fallback to `/public/models/` in development.
3. **Reduced Motion Preferences**: When implementing R2/R4, users with `prefers-reduced-motion: reduce` should have 3D scroll-driven camera motion disabled or simplified to a static view.
4. **No Unit Test Runner**: `package.json` currently has no test framework installed (`vitest` is missing). Unit testing for `ProductScene` will require installing `vitest`, `@testing-library/react`, and mocking `@react-three/fiber` canvas rendering.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 3D Performance & Lazy Loading (R4)
1. **Lazy-Load `ProductScene`**:
   - In `src/App.tsx`:
     ```tsx
     const ProductScene = React.lazy(() => 
       import('./components/scene/ProductScene').then(m => ({ default: m.ProductScene }))
     )
     ```
   - Provide a lightweight CSS fallback spinner `<ProductSceneFallback />` inside `<Suspense fallback={<ProductSceneFallback />}>`.
2. **Remove `vite-plugin-singlefile`**:
   - Update `vite.config.ts` to disable `viteSingleFile()` for production web builds so Vite can generate split chunks (`vendor-three`, `vendor-react`, `scene`).
3. **Memoise Keyframe Evaluation**:
   - Pre-sort `PRESSER_KEYFRAMES` and `TAP_KEYFRAMES` at module initialization.
   - Cache previous `t` and returned `MotionState`. If `Math.abs(t - lastT) < 1e-5`, return the cached state immediately without running lerp math or allocating arrays.
4. **Enable Frustum Culling & Visibility Gating**:
   - In `TabModel`: In `TutorialTap`, set `ref.current.visible = false` when `t < TUTORIAL_START || t > TUTORIAL_END` (or when scale is damped below 0.001).
   - In `Pwh.tsx` and `TabModel.tsx`: Explicitly set `mesh.frustumCulled = true` and call `mesh.geometry.computeBoundingSphere()` during model normalization.
5. **Decouple Scroll State from React Rerenders**:
   - Use a mutable ref `scrollProgressRef` read inside `useFrame`, preventing scroll events from triggering React virtual DOM diffing on the canvas.

### 4.2 Code Quality & Modular Decomposition (R5)
Split `src/components/ProductScene.tsx` into a modular package `src/components/scene/`:
```
src/components/scene/
├── types.ts              // Keyframe, MotionState, SplinePoint, SceneConfig
├── constants.ts          // All animation bounds, damping factors, camera configs, lighting, materials
├── animation.ts          // Memoized evaluateKeyframe, lerp, damp helpers
├── Lighting.tsx          // Ambient, directional lights, and local Environment setup
├── CameraController.tsx  // Aspect ratio detection & responsive FOV updates
├── PresserModel.tsx      // Presser spline travel & tutorial keyframing (with frustum culling)
├── TapModel.tsx          // Tap tutorial keyframing & visibility culling
├── ProductScene.tsx      // Orchestrator: Canvas, scroll listener, context recovery
├── ProductSceneFallback.tsx // CSS spinner matching dark hero theme
└── index.ts              // Barrel export
```
- **Remove Dead Dependencies**:
  - Remove `@react-three/postprocessing` from `package.json`.
  - Move or delete unused dev tools `AnimationStudio.tsx` and `AlignmentTool.tsx` from `src/` to a dedicated `tools/` directory.
  - Delete `src/App.css` (dead boilerplate Vite CSS).

### 4.3 TypeScript Typings (R5)
- Replace all `child: any` in model traversals with:
  ```ts
  scaledScene.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      child.frustumCulled = true
      child.material = material
    }
  })
  ```
- Replace `catch (err: any)` with `catch (err: unknown)`.
- Define explicit interfaces in `types.ts`:
  ```ts
  export interface Keyframe {
    t: number
    pos: [x: number, y: number, z: number]
    rot: [x: number, y: number, z: number]
    scale: number
  }

  export interface MotionState {
    pos: [x: number, y: number, z: number]
    rot: [x: number, y: number, z: number]
    scale: number
  }

  export interface ProductSceneProps {
    className?: string
    onLoaded?: () => void
  }
  ```

### 4.4 Asset Management & CDN Migration (R6)
1. **Clean Root & Public Directory**:
   - Delete `public/tab.glb` (saves 34.05 MB).
   - Move CAD engineering files (`pwh.SLDPRT`, `pwh.STEP`, `pwh.STL`) to `cad/` directory outside `src/` and `public/`.
   - Add `presser_standalone.html` to `.gitignore` or delete (saves 47.12 MB).
2. **CDN Serving for 3D Models**:
   - Configure model asset loader utility:
     ```ts
     const CDN_BASE = import.meta.env.VITE_CDN_URL || ''
     export const getAssetUrl = (path: string) => `${CDN_BASE}${path}`
     ```
   - Load `tab-v1.glb` (4.28 MB) and `pwh.glb` (206 KB) using `getAssetUrl('/models/tab-v1.glb')`.
3. **Restructure `src/assets/`**:
   ```
   src/assets/
   ├── images/
   │   └── hero-fallback.webp
   └── icons/
   ```
   Remove unused starter SVGs (`react.svg`, `vite.svg`).

---

## 5. Verification Method

### 5.1 Independent Inspection Commands & Paths
1. **Verify Static Imports & Eager Loading**:
   - Inspect `src/App.tsx:4` and `src/main.tsx:4–6`. Verify static imports of `ProductScene` and all route components.
2. **Verify Keyframe Evaluation Overhead**:
   - Inspect `src/components/ProductScene.tsx:14–32`. Check array creation `[...kfs]` and `.sort()` on lines 16 and 75, 157 inside `useFrame`.
3. **Verify Mesh Visibility & Culling**:
   - Inspect `src/components/ProductScene.tsx:88`. Note `ref.current.scale.setScalar(...)` is used without `ref.current.visible = false`.
   - Inspect `src/components/Pwh.tsx:22–34` and `src/components/TabModel.tsx:35–40`. Note absence of `frustumCulled`.
4. **Verify Asset Sizes**:
   - Check file sizes:
     - `public/tab.glb`: 34,053,864 bytes
     - `public/tab-v1.glb`: 4,283,540 bytes
     - `presser_standalone.html`: 47,124,737 bytes
5. **Verify Build & SingleFile Bundling**:
   - Inspect `vite.config.ts:8` for `viteSingleFile()`.
   - Inspect `dist/index.html` size (1,370,928 bytes inlined).

### 5.2 Validation Criteria for Downstream Implementers
- `npm run build` generates split chunks, reducing initial bundle index HTML/JS to <200 KB (over 80% reduction, exceeding the 10% criteria).
- In Chrome DevTools Performance panel, zero array allocation and GC spikes occur during scroll animation.
- WebGL draw calls drop to 1 (only presser model) when scroll position is outside the tutorial section.
- Large 3D models load from CDN URL when `VITE_CDN_URL` is set.
