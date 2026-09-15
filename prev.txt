import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Model } from './Pwh'
import { TabModel } from './TabModel'

// ─────────────────────────────────────────────────────────────────────────────
// Keyframe evaluator  (shared with Animation Studio)
// ─────────────────────────────────────────────────────────────────────────────
interface KF { t: number; pos: [number,number,number]; rot: [number,number,number]; scale: number }
interface MS  { pos: [number,number,number]; rot: [number,number,number]; scale: number }

function evalAt(kfs: KF[], t: number): MS {
  if (!kfs.length) return { pos:[0,0,0], rot:[0,0,0], scale:1 }
  const s = [...kfs].sort((a,b) => a.t - b.t)
  if (t <= s[0].t)           return { pos:[...s[0].pos],           rot:[...s[0].rot],           scale:s[0].scale }
  const last = s[s.length-1]
  if (t >= last.t)           return { pos:[...last.pos],           rot:[...last.rot],           scale:last.scale }
  for (let i = 0; i < s.length-1; i++) {
    if (t >= s[i].t && t <= s[i+1].t) {
      const f = (t - s[i].t) / (s[i+1].t - s[i].t)
      const L = THREE.MathUtils.lerp
      return {
        pos:   [L(s[i].pos[0],s[i+1].pos[0],f), L(s[i].pos[1],s[i+1].pos[1],f), L(s[i].pos[2],s[i+1].pos[2],f)],
        rot:   [L(s[i].rot[0],s[i+1].rot[0],f), L(s[i].rot[1],s[i+1].rot[1],f), L(s[i].rot[2],s[i+1].rot[2],f)],
        scale: L(s[i].scale, s[i+1].scale, f)
      }
    }
  }
  return { pos:[...last.pos], rot:[...last.rot], scale:last.scale }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page layout — 4 sections after removing interactive section:
//   Hero 100vh + Testimonials 100vh + HowItWorks 400vh + Preorder 100vh = 700vh
//   Scrollable height = 600vh
//   Tutorial starts when HowItWorks begins  = 200 / 600 = 0.333
//   Tutorial ends before Preorder begins    = 600 / 600 = 1.0
//   → leave a small buffer for preorder entry: TUTORIAL_END = 0.88
// ─────────────────────────────────────────────────────────────────────────────
const TUTORIAL_START = 0.33
const TUTORIAL_END   = 0.88

// Keyframes produced in Animation Studio
const PRESSER_KFS: KF[] = [
  { t:0.00, pos:[ 0.000, 0.000, 0.000], rot:[ 2.000, 0.000, 0.000], scale:1.000 }, // ← user start 
  { t:0.40, pos:[-2.469,-0.007,-0.263], rot:[ 3.140, 0.000, 1.575], scale:1.000 },
  { t:0.50, pos:[-2.401, 0.482, 0.046], rot:[ 1.575, 0.000, 1.575], scale:1.000 },
  { t:0.60, pos:[-2.401, 0.482, 0.046], rot:[ 0.000, 0.000, 1.575], scale:1.000 },
  { t:1.00, pos:[ 0.000, 0.000, 0.000], rot:[ 0.000, 0.000, 0.000], scale:1.000 }, // ← user end
]

const TAP_KFS: KF[] = [
  { t:0.00, pos:[ 0.000, 0.000, 0.000], rot:[0,0,0], scale:0.050 },
  { t:0.40, pos:[-0.084,-0.463,-0.522], rot:[0,0,0], scale:2.000 },
  { t:0.50, pos:[-0.084,-0.463,-0.522], rot:[0,0,0], scale:2.000 },
  { t:0.60, pos:[-0.084,-0.463,-0.522], rot:[0,0,0], scale:2.000 },
  { t:1.00, pos:[ 0.000, 0.000, 0.000], rot:[0,0,0], scale:0.050 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Tap — purely keyframe-driven during tutorial, invisible elsewhere
// ─────────────────────────────────────────────────────────────────────────────
function TutorialTap({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((_s, dt) => {
    if (!ref.current) return
    const t = Math.max(0, Math.min(1, scrollProgress))
    const d = (a: number, b: number) => THREE.MathUtils.damp(a, b, 7, dt)

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

// ─────────────────────────────────────────────────────────────────────────────
// Presser — smooth spline for hero / testimonials / preorder,
//           exact keyframes for the tutorial zone
// ─────────────────────────────────────────────────────────────────────────────
function ScrollModel({ scrollProgress, maxX, isMobile }: {
  scrollProgress: number
  maxX: number
  isMobile: boolean
}) {
  const ref = useRef<THREE.Group>(null)

  // ── Spline control points (non-tutorial sections) ──────────────────────────
  // 7 points, evenly spaced (each covers 1/6 of scroll):
  //
  //   idx 0  t=0.000  Hero start
  //   idx 1  t=0.167  Testimonials peak (gentle LEFT sweep to avoid text on the right)
  //   idx 2  t=0.333  HANDOFF → exactly [0,0,0] rot[2,0,0] to match PRESSER_KFS[0]
  //   idx 3  t=0.500  (inside tutorial — overridden, set to [0,0,0] to avoid artifacts)
  //   idx 4  t=0.667  (inside tutorial — overridden)
  //   idx 5  t=0.833  RETURN  → [0,0,0] matches PRESSER_KFS last → departs to preorder
  //   idx 6  t=1.000  Preorder (centred, zoomed)
  const pathCurve = React.useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,            0.4,   isMobile ? 5.0 : 4.0), // 0.000 Hero — visible, centred
    new THREE.Vector3(-maxX * 0.6,  0.1,   isMobile ? 3.0 : 2.0), // 0.167 Testimonials — gentle left sweep
    new THREE.Vector3(0,            0,     0),                     // 0.333 ← HANDOFF to tutorial
    new THREE.Vector3(0,            0,     0),                     // 0.500 (tutorial, unused)
    new THREE.Vector3(0,            0,     0),                     // 0.667 (tutorial, unused)
    new THREE.Vector3(0,            0,     0),                     // 0.833 ← RETURN from tutorial
    new THREE.Vector3(0,           -0.6,   isMobile ? 6.0 : 7.0), // 1.000 Preorder — zoomed
  ], false, 'centripetal'), [maxX, isMobile])

  // Rotation at each control point
  // idx 2 = [2.0, 0, 0] exactly matches PRESSER_KFS[0].rot → zero-jump handoff
  // idx 5 = [0,   0, 0] exactly matches PRESSER_KFS[4].rot → zero-jump return
  const RX = [
     2.0 - Math.PI * 2, // 0.000 Hero: starts exactly one full 360 flip backward
     2.0 - Math.PI,     // 0.167 Testimonials: halfway through flip (180 deg)
     2.0,               // 0.333 → completes exactly a 360 tumble into handoff
     0,                 // 0.500 (tutorial, unused)
     0,                 // 0.667 (tutorial, unused)
     0,                 // 0.833 → matches PRESSER_KFS[last].rot.x = 0
    -0.1,               // 1.000 Preorder: very slight backward lean
  ]
  const RY = [
    -Math.PI * 2,       // 0.000 Hero: starts exactly one full 360 spin backward
    -Math.PI,           // 0.167 Testimonials: halfway through spin (180 deg)
     0,                 // 0.333 → completes exactly a 360 spin into handoff (0 deg)
     0,                 // 0.500 (tutorial, unused)
     0,                 // 0.667 (tutorial, unused)
     0,                 // 0.833 → matches PRESSER_KFS[last].rot.y = 0
     Math.PI * 0.25,    // 1.000 Preorder: pleasant angled view
  ]
  const RZ = [0, 0, 0, 0, 0, 0, 0]

  useFrame((state, dt) => {
    if (!ref.current) return
    const t = Math.max(0, Math.min(1, scrollProgress))
    const d = (a: number, b: number) => THREE.MathUtils.damp(a, b, 3.5, dt)

    // ── Tutorial zone: keyframes ───────────────────────────────────────────
    if (t >= TUTORIAL_START && t <= TUTORIAL_END) {
      const lT = (t - TUTORIAL_START) / (TUTORIAL_END - TUTORIAL_START)
      const st = evalAt(PRESSER_KFS, lT)
      ref.current.position.x = d(ref.current.position.x, st.pos[0])
      ref.current.position.y = d(ref.current.position.y, st.pos[1])
      ref.current.position.z = d(ref.current.position.z, st.pos[2])
      ref.current.rotation.x = d(ref.current.rotation.x, st.rot[0])
      ref.current.rotation.y = d(ref.current.rotation.y, st.rot[1])
      ref.current.rotation.z = d(ref.current.rotation.z, st.rot[2])
      ref.current.scale.setScalar(d(ref.current.scale.x, st.scale))
      return
    }

    // ── Non-tutorial: smooth spline ────────────────────────────────────────
    const targetPos = pathCurve.getPoint(t)

    // Gentle idle float — only outside tutorial to avoid fighting keyframes
    const floatY = Math.sin(state.clock.elapsedTime * 0.8) * 0.07

    const seg  = t * 6
    const idx  = Math.min(Math.floor(seg), 5)
    const frac = seg - idx
    const L    = THREE.MathUtils.lerp
    const tRX  = L(RX[idx], RX[idx+1], frac)
    const tRY  = L(RY[idx], RY[idx+1], frac)
    const tRZ  = L(RZ[idx], RZ[idx+1], frac)

    ref.current.position.x = d(ref.current.position.x, targetPos.x)
    ref.current.position.y = d(ref.current.position.y, targetPos.y + floatY)
    ref.current.position.z = d(ref.current.position.z, targetPos.z)
    ref.current.rotation.x = d(ref.current.rotation.x, tRX)
    ref.current.rotation.y = d(ref.current.rotation.y, tRY)
    ref.current.rotation.z = d(ref.current.rotation.z, tRZ)
    ref.current.scale.setScalar(d(ref.current.scale.x, 1))
  })

  return <group ref={ref}><Model /></group>
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene — wires everything together with responsive layout values
// ─────────────────────────────────────────────────────────────────────────────
function SceneContents({ scrollProgress }: { scrollProgress: number }) {
  const { viewport, camera } = useThree()

  const aspect   = viewport.width / viewport.height
  const isMobile = aspect < 0.85

  // How far the model can travel left/right on screen
  // Mobile: tighter — keep model fully visible within narrow width
  // Desktop: wider travel for cinematic sweep
  const maxX = isMobile
    ? Math.min(1.4, viewport.width * 0.22)
    : Math.min(3.2, (viewport.width / 2) - 1.2)

  // Adjust camera FOV once for the current aspect ratio
  React.useEffect(() => {
    const c = camera as THREE.PerspectiveCamera
    c.fov = isMobile ? 55 : 45   // wider fov on mobile keeps model in frame
    c.updateProjectionMatrix()
  }, [isMobile, camera])

  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[8, 10, 8]}   intensity={2.5} castShadow />
      <directionalLight position={[-6, 4, -4]}  intensity={1.2} />
      <directionalLight position={[0, -8, 6]}   intensity={0.6} />
      <Environment preset="warehouse" />

      <TutorialTap scrollProgress={scrollProgress} />

      <ScrollModel
        scrollProgress={scrollProgress}
        maxX={maxX}
        isMobile={isMobile}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductScene — scroll listener + WebGL recovery
// ─────────────────────────────────────────────────────────────────────────────
export function ProductScene() {
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [canvasKey,      setCanvasKey]      = React.useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const total   = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(total > 0 ? window.scrollY / total : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-recover from WebGL context loss
  useEffect(() => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (!canvas) return
    const onLost = (e: Event) => {
      e.preventDefault()
      setTimeout(() => setCanvasKey(k => k + 1), 500)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [canvasKey])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ powerPreference: 'high-performance', antialias: true }}
        dpr={[1, 1.5]}   // cap pixel ratio for mobile GPU perf
      >
        <SceneContents scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}
