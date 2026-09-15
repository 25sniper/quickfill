# Handoff Report: Features F14 (Frustum Culling & Visibility Toggling) & F15 (Strict TypeScript Typings)

**Agent**: Explorer M3-3 (`explorer_m3_3`)  
**Working Directory**: `a:\downloads\presser\.agents\explorer_m3_3`  
**Milestone**: M3 (Features F14 & F15)  
**Parent Orchestrator**: `1d693b99-1b39-4f36-a45f-ea64a8fb1005`  
**Date**: 2026-09-10  

---

## 1. Observation

### 1.1 F14: Frustum Culling & Visibility Toggling State
1. **`src/components/ProductScene.tsx` (lines 66–95)**:
   ```tsx
   function TutorialTap({ scrollProgress, prefersReducedMotion = false }: { scrollProgress: number; prefersReducedMotion?: boolean }) {
     const ref = useRef<THREE.Group>(null)

     useFrame((_s, dt) => {
       if (!ref.current) return
       const t = Math.max(0, Math.min(1, scrollProgress))
       const dampingFactor = prefersReducedMotion ? 20 : 7
       const d = (a: number, b: number) => THREE.MathUtils.damp(a, b, dampingFactor, dt)

       if (t >= TUTORIAL_START && t <= TUTORIAL_END) {
         const lT = (t - TUTORIAL_START) / (TUTORIAL_END - TUTORIAL_START)
         const st = evalAt(TAP_KFS, lT)
         ref.current.position.set(
           d(ref.current.position.x, st.pos[0]),
           d(ref.current.position.y, st.pos[1]),
           d(ref.current.position.z, st.pos[2])
         )
         ref.current.rotation.set(
           d(ref.current.rotation.x, st.rot[0]),
           d(ref.current.rotation.y, st.rot[1]),
           d(ref.current.rotation.z, st.rot[2])
         )
         ref.current.scale.setScalar(d(ref.current.scale.x, st.scale))
       } else {
         ref.current.scale.setScalar(d(ref.current.scale.x, 0))
       }
     })

     return <group ref={ref}><TabModel /></group>
   }
   ```
   - **Direct Observation**: When `t < TUTORIAL_START` or `t > TUTORIAL_END`, only `ref.current.scale.setScalar(...)` is called towards 0.
   - `ref.current.visible` is **never** set to `false`.
   - Three.js continues to traverse `<group ref={ref}><TabModel /></group>` during rendering passes even when scaled to 0, incurring unnecessary matrix recalculations and draw calls.
   - Furthermore, `useFrame` performs damping on every frame outside the tutorial section instead of short-circuiting.

2. **`src/components/Pwh.tsx` (lines 22–34, 42–50)**:
   ```tsx
   clonedScene.traverse((child: any) => {
     if ((child as any).isMesh) {
       const mesh = child as THREE.Mesh
       mesh.material = new THREE.MeshPhysicalMaterial({ ... })
     }
   })
   ```
   - **Direct Observation**: Neither `mesh.frustumCulled = true` nor `mesh.geometry.computeBoundingSphere()` / `mesh.geometry.computeBoundingBox()` are called.
   - Unmount cleanup traverses with `(child: any)` and disposes materials, but does not dispose `mesh.geometry`.

3. **`src/components/TabModel.tsx` (lines 35–39, 47–57)**:
   ```tsx
   clonedScene.traverse((child: any) => {
     if ((child as THREE.Mesh).isMesh) {
       ;(child as THREE.Mesh).material = material
     }
   })
   ```
   - **Direct Observation**: Neither `mesh.frustumCulled = true` nor `mesh.geometry.computeBoundingSphere()` / `mesh.geometry.computeBoundingBox()` are called.

4. **`tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs`**:
   - Test 1 (lines 8–12): Checks that `TUTORIAL_START` and `TUTORIAL_END` are in `ProductScene.tsx` or `src/components/scene/TutorialTap.tsx`.
   - Test 2 (lines 14–18): Checks that source code includes `scale.setScalar` or `visible = false` or `visible=`.
   - Test 3 (lines 20–23): Checks that `TUTORIAL_BOUNDS.END - TUTORIAL_BOUNDS.START === 0.55` (`0.88 - 0.33`).
   - Test 4 (lines 25–31): Verifies that model is hidden at `t=0.1` and `t=0.95`, and visible at `t=0.5`.
   - Test 5 (lines 33–37): Checks that `ProductScene.tsx` maintains Three.js group hierarchy (`<group` or `group ref=`).

---

### 1.2 F15: Strict TypeScript Typings State
1. **Absence of `src/components/scene/types.ts`**:
   - `src/components/scene/types.ts` currently does not exist.
   - Types inside `ProductScene.tsx` are non-standard abbreviated interfaces:
     ```ts
     interface KF { t: number; pos: [number,number,number]; rot: [number,number,number]; scale: number }
     interface MS { pos: [number,number,number]; rot: [number,number,number]; scale: number }
     ```
2. **`any` usages in codebase (`grep_search` results)**:
   - `src/components/Pwh.tsx`:
     - Line 22: `clonedScene.traverse((child: any) => {`
     - Line 23: `if ((child as any).isMesh) {`
     - Line 42: `scaledScene.traverse((child: any) => {`
   - `src/components/TabModel.tsx`:
     - Line 35: `clonedScene.traverse((child: any) => {`
     - Line 47: `clone.traverse((child: any) => {`
   - `src/AdminDashboard.tsx`:
     - Line 58: `} catch (err: any) {`
   - `src/Checkout.tsx`:
     - Line 40: `} catch (err: any) {`
   - `src/hooks/useReducedMotion.ts`:
     - Lines 53–56: `(mediaQueryList as any).addListener(...)`
3. **Compiler Configuration (`tsconfig.app.json`)**:
   - Line 14: `"verbatimModuleSyntax": true`
   - All type imports must strictly use `import type { ... }` or `import { type ... }`.
4. **`tests/e2e/tier1-feature-coverage/f15-typescript-types.test.mjs`**:
   - Test 1: `tsconfig.json` references `tsconfig.app.json`.
   - Test 2: `Keyframe` defines `pos: [number, number, number]`, `rot: [number, number, number]`, `scale: number` in `ProductScene.tsx` or `src/components/scene/types.ts`.
   - Test 3: `Order` interface in `AdminDashboard.tsx` strongly types `customer_name`, `status`, `price`.
   - Test 4: `api.ts` types `createOrder(data: { customer_name: string, number: string, price: number, custom_photo?: string })`.
   - Test 5: `main.tsx` uses non-null assertion `document.getElementById('root')!`.

---

## 2. Logic Chain

1. **Frustum Culling & Bounding Spheres Mechanism**:
   - In Three.js, when `mesh.frustumCulled = true`, the WebGL renderer checks if `mesh.geometry.boundingSphere` intersects the camera frustum before issuing draw calls.
   - If `boundingSphere` is missing or stale after scaling or cloning, culling may misbehave or cause rendering artifacts.
   - By explicitly calling `mesh.frustumCulled = true`, `mesh.geometry.computeBoundingSphere()`, and `mesh.geometry.computeBoundingBox()` during GLTF scene cloning in both `PresserModel` (`Pwh`) and `TapModel`, all meshes are guaranteed to have accurate bounding spheres and participate in GPU frustum culling.

2. **Visibility Toggling on `TutorialTap`**:
   - The tutorial faucet tap model is only meant to be seen during the "How It Works" tutorial section: `t ∈ [TUTORIAL_START, TUTORIAL_END]` (`[0.33, 0.88]`).
   - In the Hero section (`t ∈ [0, 0.33)`) and Preorder section (`t ∈ (0.88, 1.0]`), the tap model should not be rendered.
   - In Three.js, setting `ref.current.visible = false` on a parent `Group` causes Three.js to completely skip the group and all its children during scene traversal (`projectObject`), avoiding matrix world updates, shader uniform bindings, and WebGL draw calls.
   - In `TutorialTap`:
     ```tsx
     const inTutorial = t >= TUTORIAL_START && t <= TUTORIAL_END
     ref.current.visible = inTutorial
     if (!inTutorial) {
       ref.current.scale.setScalar(0)
       return
     }
     ```
   - Returning early when `!inTutorial` also prevents per-frame keyframe evaluations and damping math when the tap is off-screen.
   - Adding `visible={scrollProgress >= TUTORIAL_START && scrollProgress <= TUTORIAL_END}` to the `<group>` in JSX ensures the model is initially hidden on mount before the first `useFrame` runs.

3. **Strict TypeScript Typings without `any`**:
   - In Three.js object traversal, `child` is typed as `THREE.Object3D`.
   - Instead of `(child: any)`, TypeScript's `child instanceof THREE.Mesh` cleanly narrows `child` to `THREE.Mesh`. This eliminates all `any` casts while providing 100% type safety for `child.material`, `child.geometry`, and `child.frustumCulled`.
   - Creating `src/components/scene/types.ts` with `Keyframe`, `MotionState`, `SceneProps`, `ModelProps`, `GLTFResult`, `CameraConfig`, and `LightingConfig` centralizes all type definitions.
   - Replacing `catch (err: any)` with `catch (err: unknown)` and `err instanceof Error ? err.message : ...` ensures strict runtime error typing.
   - Typing legacy `MediaQueryList` methods in `useReducedMotion.ts` eliminates `(mediaQueryList as any)`.

---

## 3. Blueprint & Concrete Implementation Specifications

### Blueprint 3.1: Create `src/components/scene/types.ts`
```typescript
import type { ComponentProps } from 'react'
import type * as THREE from 'three'

/**
 * 3D coordinate tuple [x, y, z].
 */
export type Vector3Tuple = [number, number, number]

/**
 * Keyframe definition for scroll-driven 3D animation.
 * Enforces strict 3-element tuples for pos and rot, and numbers for t and scale.
 */
export interface Keyframe {
  t: number
  pos: [number, number, number]
  rot: [number, number, number]
  scale: number
}

/** Backward-compatible alias for Keyframe */
export type KF = Keyframe

/**
 * Interpolated 3D motion state representing position, rotation, and scale.
 */
export interface MotionState {
  pos: [number, number, number]
  rot: [number, number, number]
  scale: number
}

/** Backward-compatible alias for MotionState */
export type MS = MotionState

/**
 * Props for the root ProductScene component.
 */
export interface SceneProps {
  className?: string
  reducedMotion?: boolean
}

/** Backward-compatible alias for SceneProps */
export type ProductSceneProps = SceneProps

/**
 * Props for internal canvas contents of ProductScene.
 */
export interface SceneContentsProps {
  scrollProgress: number
  prefersReducedMotion?: boolean
}

/**
 * Props for the TutorialTap 3D model component.
 */
export interface TutorialTapProps {
  scrollProgress: number
  prefersReducedMotion?: boolean
}

/**
 * Props for the ScrollModel (Presser) component.
 */
export interface ScrollModelProps {
  scrollProgress: number
  maxX: number
  isMobile: boolean
  prefersReducedMotion?: boolean
}

/**
 * Base props for 3D group models (PresserModel, TapModel).
 */
export type ModelProps = ComponentProps<'group'>

/**
 * Strongly typed GLTF loading result.
 * Eliminates all `any` when working with `useGLTF`.
 */
export interface GLTFResult {
  scene: THREE.Group
  scenes: THREE.Group[]
  animations: THREE.AnimationClip[]
  cameras: THREE.Camera[]
  asset: {
    generator?: string
    version?: string
    [key: string]: unknown
  }
  nodes: Record<string, THREE.Object3D | THREE.Mesh>
  materials: Record<string, THREE.Material>
}

/**
 * Camera configuration parameters.
 */
export interface CameraConfig {
  position: Vector3Tuple
  fov: number
  near: number
  far: number
  mobileFov: number
  desktopFov: number
}

/**
 * Directional light configuration.
 */
export interface DirectionalLightConfig {
  position: Vector3Tuple
  intensity: number
  castShadow?: boolean
}

/**
 * Scene lighting configuration.
 */
export interface LightingConfig {
  ambientIntensity: number
  keyLight: DirectionalLightConfig
  fillLight: DirectionalLightConfig
  backLight: DirectionalLightConfig
  environmentPreset: 'warehouse' | 'city' | 'sunset' | 'dawn' | 'night' | 'studio' | 'forest' | 'apartment' | 'park' | 'lobby'
}

/**
 * Damping factors configuration for animation interpolation.
 */
export interface AnimationConfig {
  standardDamping: number
  reducedDamping: number
  tapStandardDamping: number
  tapReducedDamping: number
}
```

---

### Blueprint 3.2: `src/components/scene/TutorialTap.tsx`
```typescript
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TabModel } from './TapModel'
import { TUTORIAL_START, TUTORIAL_END, TAP_KFS } from './constants'
import { evalAt } from './animation'
import type { TutorialTapProps } from './types'

export function TutorialTap({ scrollProgress, prefersReducedMotion = false }: TutorialTapProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame((_s, dt) => {
    if (!ref.current) return
    const t = Math.max(0, Math.min(1, scrollProgress))
    const inTutorial = t >= TUTORIAL_START && t <= TUTORIAL_END

    // Feature F14: Toggle visibility to false when outside tutorial range.
    // Suppresses all child matrix recalculations and WebGL draw calls off-screen.
    ref.current.visible = inTutorial

    if (!inTutorial) {
      ref.current.scale.setScalar(0)
      return
    }

    const dampingFactor = prefersReducedMotion ? 20 : 7
    const d = (a: number, b: number) => THREE.MathUtils.damp(a, b, dampingFactor, dt)

    const lT = (t - TUTORIAL_START) / (TUTORIAL_END - TUTORIAL_START)
    const st = evalAt(TAP_KFS, lT)
    ref.current.position.set(
      d(ref.current.position.x, st.pos[0]),
      d(ref.current.position.y, st.pos[1]),
      d(ref.current.position.z, st.pos[2])
    )
    ref.current.rotation.set(
      d(ref.current.rotation.x, st.rot[0]),
      d(ref.current.rotation.y, st.rot[1]),
      d(ref.current.rotation.z, st.rot[2])
    )
    ref.current.scale.setScalar(d(ref.current.scale.x, st.scale))
  })

  return (
    <group 
      ref={ref}
      visible={scrollProgress >= TUTORIAL_START && scrollProgress <= TUTORIAL_END}
    >
      <TabModel />
    </group>
  )
}

export default TutorialTap
```

---

### Blueprint 3.3: `src/components/scene/PresserModel.tsx` (and `src/components/Pwh.tsx`)
```typescript
import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ModelProps } from './types'

export function Model(props: ModelProps) {
  const { scene } = useGLTF('/pwh.glb')
  
  const scaledScene = useMemo(() => {
    const clonedScene = scene.clone(true)
    
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    
    if (maxDim > 0 && isFinite(maxDim)) {
      const scale = 3 / maxDim
      clonedScene.scale.setScalar(scale)
      clonedScene.position.sub(center.multiplyScalar(scale))
    }
    
    // Feature F14 & F15: Strict traversal typing without `any`, frustum culling & bounds computation
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
          child.geometry.computeBoundingBox()
        }
        child.material = new THREE.MeshPhysicalMaterial({
          color: '#e0e0e0',
          metalness: 0.8,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          side: THREE.DoubleSide
        })
      }
    })

    clonedScene.updateMatrixWorld(true)
    return clonedScene
  }, [scene])

  // Dispose GPU materials and geometry when unmounted
  useEffect(() => {
    return () => {
      scaledScene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: THREE.Material) => m.dispose())
          } else if (child.material) {
            child.material.dispose()
          }
          if (child.geometry) {
            child.geometry.dispose()
          }
        }
      })
    }
  }, [scaledScene])

  return (
    <group {...props} dispose={null}>
      <primitive object={scaledScene} />
    </group>
  )
}

useGLTF.preload('/pwh.glb')
export const PresserModel = Model
export default Model
```

---

### Blueprint 3.4: `src/components/scene/TapModel.tsx` (and `src/components/TabModel.tsx`)
```typescript
import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ModelProps } from './types'

export function TabModel(props: ModelProps = {}) {
  const { scene } = useGLTF('/tab-v1.glb')
  
  const clone = useMemo(() => {
    const clonedScene = scene.clone(true)
    
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    
    // Scale so the tap fits inside the attachment
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0 && isFinite(maxDim)) {
      const scale = 3.2 / maxDim
      clonedScene.scale.setScalar(scale)
      clonedScene.position.sub(center.multiplyScalar(scale))
    }
    
    // Warm polished brass material
    const material = new THREE.MeshPhysicalMaterial({
      color: '#c8a44a',
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      emissive: new THREE.Color('#3d2a00'),
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    })
    
    // Feature F14 & F15: Strict traversal typing without `any`, frustum culling & bounds computation
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
          child.geometry.computeBoundingBox()
        }
        child.material = material
      }
    })

    clonedScene.updateMatrixWorld(true)
    return clonedScene
  }, [scene])

  // Dispose GPU materials and geometry on unmount
  useEffect(() => {
    return () => {
      clone.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: THREE.Material) => m.dispose())
          } else if (child.material) {
            child.material.dispose()
          }
          if (child.geometry) {
            child.geometry.dispose()
          }
        }
      })
    }
  }, [clone])

  return (
    <group {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  )
}

useGLTF.preload('/tab-v1.glb')
export const TapModelAlias = TabModel
export default TabModel
```

---

### Blueprint 3.5: Clean Up `any` in Catch Blocks & Event Listeners
1. **`src/AdminDashboard.tsx` Line 58**:
   ```typescript
   // Before:
   } catch (err: any) {
     setLoginError('Invalid username or password')
   }

   // After:
   } catch (err: unknown) {
     const message = err instanceof Error ? err.message : 'Invalid username or password'
     setLoginError(message)
   }
   ```
2. **`src/Checkout.tsx` Line 40**:
   ```typescript
   // Before:
   } catch (err: any) {
     console.error(err)
     setError(err.message || 'Something went wrong. Please try again.')
   }

   // After:
   } catch (err: unknown) {
     console.error(err)
     setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
   }
   ```
3. **`src/hooks/useReducedMotion.ts` Lines 52–58**:
   ```typescript
   // Before:
   else if (typeof (mediaQueryList as any).addListener === 'function') {
     ;(mediaQueryList as any).addListener(handleChange)
     return () => {
       ;(mediaQueryList as any).removeListener(handleChange)
     }
   }

   // After:
   else if ('addListener' in mediaQueryList && typeof (mediaQueryList as MediaQueryList & { addListener?: unknown }).addListener === 'function') {
     const legacyMql = mediaQueryList as MediaQueryList & {
       addListener: (cb: (e: MediaQueryListEvent) => void) => void
       removeListener: (cb: (e: MediaQueryListEvent) => void) => void
     }
     legacyMql.addListener(handleChange)
     return () => {
       legacyMql.removeListener(handleChange)
     }
   }
   ```

---

## 4. Caveats

1. **Modularization Coordination with Explorer M3-1**:
   - `f14-5` in `tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs` checks `readSourceFile('src/components/ProductScene.tsx')` for `<group` or `group ref=`.
   - Therefore, `src/components/ProductScene.tsx` should either directly compose `<group>` elements or import and render subcomponents that clearly declare `<group>` in their JSX.
2. **Backward Compatibility Exports**:
   - Existing components and tests import from `src/components/ProductScene.tsx`, `src/components/Pwh.tsx`, and `src/components/TabModel.tsx`.
   - Re-exporting from both the original file paths and the new modular subpaths (`src/components/scene/`) guarantees zero regressions.
3. **Strict Import Syntax**:
   - Since `verbatimModuleSyntax: true` is enabled in `tsconfig.app.json`, all imports of types (`Keyframe`, `MotionState`, `SceneProps`, `ModelProps`, etc.) MUST use `import type { ... }` or `import { type ... }`.

---

## 5. Conclusion

- **F14 (Frustum Culling & Visibility Toggling)**:
  - `TutorialTap` must explicitly toggle `ref.current.visible = inTutorial`, return early when off-screen to avoid redundant per-frame damping math, and declare `visible={...}` on its JSX `<group>`.
  - All GLTF meshes in `PresserModel` (`Pwh`) and `TapModel` must set `child.frustumCulled = true` and call `child.geometry.computeBoundingSphere()` and `child.geometry.computeBoundingBox()` during cloning.
- **F15 (Strict TypeScript Typings)**:
  - Define all required interfaces in `src/components/scene/types.ts` (`Keyframe`, `MotionState`, `SceneProps`, `ModelProps`, `GLTFResult`, `CameraConfig`, `LightingConfig`, `AnimationConfig`).
  - Eliminate all `any` types across the 3D scene code by using `child instanceof THREE.Mesh` type narrowing.
  - Eliminate all `any` types in catch blocks (`err: unknown`) and media query event listeners.

---

## 6. Verification Method

1. **E2E Test Suite**:
   Verify that all tier test suites pass without regression:
   - `node tests/e2e/runner.mjs` (or inspect `tests/e2e/tier1-feature-coverage/f14-frustum-culling.test.mjs` and `f15-typescript-types.test.mjs`).
2. **Static Type Checking**:
   - Run `npx tsc --noEmit` or inspect TypeScript compilation via `npm run build`.
   - Verify zero TypeScript type errors across `src/components/scene/types.ts` and scene components.
3. **Grep Audit for `any` Elimination**:
   - Run ripgrep:
     `rg "\bany\b" src/components/scene/`
     `rg "\bany\b" src/components/Pwh.tsx src/components/TabModel.tsx`
   - Confirm 0 occurrences of `any` in all 3D scene code.
4. **Invalidation Conditions**:
   - If `TutorialTap` is visible when `t = 0.1` or `t = 0.95`.
   - If `Keyframe` in `types.ts` fails to define `pos`, `rot`, or `scale`.
   - If `Pwh.tsx` or `TabModel.tsx` retains `(child: any)`.
