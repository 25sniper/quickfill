import React, { useRef, useMemo, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, useGLTF, Environment } from "@react-three/drei"
import * as THREE from "three"

// Models accept scale as a uniform multiplier on top of the base normalised size
function PressAttachment({ pos, rot, scale }: { pos: [number,number,number], rot: [number,number,number], scale: number }) {
  const { scene } = useGLTF("/pwh.glb")
  const mesh = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const base = 3 / Math.max(size.x, size.y, size.z)
    clone.scale.setScalar(base)
    clone.position.sub(center.multiplyScalar(base))
    clone.traverse(c => {
      if ((c as THREE.Mesh).isMesh) {
        (c as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
          color: "#c0c0c0", metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide
        })
      }
    })
    return clone
  }, [scene])
  return <primitive object={mesh} position={pos} rotation={rot} scale={[scale, scale, scale]} />
}

function TapModel({ pos, rot, scale }: { pos: [number,number,number], rot: [number,number,number], scale: number }) {
  const { scene } = useGLTF("/tab.glb")
  const mesh = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const base = 3.2 / Math.max(size.x, size.y, size.z)
    clone.scale.setScalar(base)
    clone.position.sub(center.multiplyScalar(base))
    clone.traverse(c => {
      if ((c as THREE.Mesh).isMesh) {
        (c as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
          color: "#b8c4cc", metalness: 1.0, roughness: 0.05,
          clearcoat: 1.0, clearcoatRoughness: 0.05, side: THREE.DoubleSide
        })
      }
    })
    return clone
  }, [scene])
  return <primitive object={mesh} position={pos} rotation={rot} scale={[scale, scale, scale]} />
}

useGLTF.preload("/pwh.glb")
useGLTF.preload("/tab.glb")

// ── Generic slider row ─────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step, onChange, accentColor = "#22d3ee" }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; accentColor?: string
}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
      <span style={{ width:24, fontSize:11, color:"#aaa", fontFamily:"monospace" }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex:1, accentColor, height:4 }} />
      <input type="number" value={value.toFixed(2)} step={step}
        onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
        style={{ width:60, fontSize:11, background:"#1e1e1e", border:"1px solid #444", borderRadius:4,
          padding:"2px 4px", color:"#fff", fontFamily:"monospace", textAlign:"right" }} />
    </div>
  )
}

// ── Model control panel ────────────────────────────────────────────────────────
function ModelPanel({ title, color, pos, rot, scale, onPos, onRot, onScale }: {
  title: string; color: string
  pos: [number,number,number]; rot: [number,number,number]; scale: number
  onPos: (axis: 0|1|2, v: number) => void
  onRot: (axis: 0|1|2, v: number) => void
  onScale: (v: number) => void
}) {
  const PI = Math.PI
  const sectionLabel: React.CSSProperties = {
    fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:2, marginBottom:6, marginTop:10
  }
  return (
    <div style={{ background:"#111", border:"1px solid #333", borderRadius:12, padding:14, marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:color }} />
        <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{title}</span>
      </div>

      {/* SIZE — single uniform ratio slider */}
      <p style={sectionLabel}>Size (uniform ratio)</p>
      <SliderRow label="S" value={scale} min={0.1} max={4} step={0.05}
        accentColor="#f59e0b" onChange={onScale} />

      <p style={sectionLabel}>Position</p>
      {(["X","Y","Z"] as const).map((ax, i) => (
        <SliderRow key={ax} label={ax} value={pos[i]} min={-6} max={6} step={0.05}
          accentColor={color} onChange={v => onPos(i as 0|1|2, v)} />
      ))}

      <p style={sectionLabel}>Rotation (rad)</p>
      {(["X","Y","Z"] as const).map((ax, i) => (
        <SliderRow key={ax} label={ax} value={rot[i]} min={-PI} max={PI} step={0.05}
          accentColor={color} onChange={v => onRot(i as 0|1|2, v)} />
      ))}
    </div>
  )
}

// ── Main Tool ──────────────────────────────────────────────────────────────────
export default function AlignmentTool() {
  const [presserPos,   setPresserPos]   = useState<[number,number,number]>([0, 0, 0])
  const [presserRot,   setPresserRot]   = useState<[number,number,number]>([0, 0, 0])
  const [presserScale, setPresserScale] = useState(1)

  const [tapPos,   setTapPos]   = useState<[number,number,number]>([2, 0, 0])
  const [tapRot,   setTapRot]   = useState<[number,number,number]>([0, 0, 0])
  const [tapScale, setTapScale] = useState(1)

  const [showGrid, setShowGrid] = useState(true)
  const [canvasKey, setCanvasKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-recover from WebGL crash
  useEffect(() => {
    const el = containerRef.current?.querySelector("canvas")
    if (!el) return
    const onLost = (e: Event) => { e.preventDefault(); setTimeout(() => setCanvasKey(k => k + 1), 500) }
    el.addEventListener("webglcontextlost", onLost)
    return () => el.removeEventListener("webglcontextlost", onLost)
  }, [canvasKey])

  const setP = (setter: React.Dispatch<React.SetStateAction<[number,number,number]>>) =>
    (axis: 0|1|2, v: number) => setter(prev => { const n=[...prev] as [number,number,number]; n[axis]=v; return n })

  const copyValues = () => {
    const txt = [
      `// Presser Attachment`,
      `position={[${presserPos.map(v=>v.toFixed(3)).join(", ")}]}`,
      `rotation={[${presserRot.map(v=>v.toFixed(3)).join(", ")}]}`,
      `scale={${presserScale.toFixed(3)}}`,
      ``,
      `// Tap`,
      `position={[${tapPos.map(v=>v.toFixed(3)).join(", ")}]}`,
      `rotation={[${tapRot.map(v=>v.toFixed(3)).join(", ")}]}`,
      `scale={${tapScale.toFixed(3)}}`,
    ].join("\n")
    navigator.clipboard.writeText(txt).then(() => alert("Copied!\n\n" + txt))
  }

  const reset = () => {
    setPresserPos([0,0,0]); setPresserRot([0,0,0]); setPresserScale(1)
    setTapPos([2,0,0]);     setTapRot([0,0,0]);     setTapScale(1)
  }

  const s: React.CSSProperties = { fontFamily:"monospace", fontSize:11, color:"#ccc", margin:0 }

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", background:"#0a0a0a", color:"#fff", overflow:"hidden" }}>

      {/* ── Sidebar ── */}
      <div style={{ width:290, flexShrink:0, display:"flex", flexDirection:"column",
        padding:16, overflowY:"auto", borderRight:"1px solid #1e1e1e" }}>

        <div style={{ marginBottom:14 }}>
          <h1 style={{ fontSize:15, fontWeight:700, margin:"0 0 2px" }}>Alignment Studio</h1>
          <p style={{ fontSize:10, color:"#444", margin:0 }}>Left drag orbit · Right drag pan · Scroll zoom</p>
        </div>

        <ModelPanel title="Presser Attachment" color="#c0c0c0"
          pos={presserPos} rot={presserRot} scale={presserScale}
          onPos={setP(setPresserPos)} onRot={setP(setPresserRot)} onScale={setPresserScale} />

        <ModelPanel title="Tap" color="#22d3ee"
          pos={tapPos} rot={tapRot} scale={tapScale}
          onPos={setP(setTapPos)} onRot={setP(setTapRot)} onScale={setTapScale} />

        {/* Buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
          <button onClick={() => setShowGrid(g=>!g)} style={{
            padding:"7px 12px", borderRadius:8, border:"1px solid #444", background:"transparent",
            color:"#aaa", fontSize:12, cursor:"pointer" }}>
            {showGrid ? "✓ " : ""}Grid
          </button>
          <button onClick={copyValues} style={{
            padding:"7px 12px", borderRadius:8, border:"none", background:"#22d3ee",
            color:"#000", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            📋 Copy as JSX props
          </button>
          <button onClick={reset} style={{
            padding:"7px 12px", borderRadius:8, border:"1px solid #444", background:"transparent",
            color:"#f87171", fontSize:12, cursor:"pointer" }}>
            ↺ Reset all
          </button>
        </div>

        {/* Live readout */}
        <div style={{ background:"#111", border:"1px solid #222", borderRadius:8, padding:12, marginTop:12 }}>
          <p style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:2, margin:"0 0 8px" }}>Live values</p>
          <p style={s}>presser</p>
          <p style={{...s, color:"#c0c0c0", marginBottom:1}}>pos [{presserPos.map(v=>v.toFixed(2)).join(", ")}]</p>
          <p style={{...s, color:"#c0c0c0", marginBottom:1}}>rot [{presserRot.map(v=>v.toFixed(2)).join(", ")}]</p>
          <p style={{...s, color:"#f59e0b", marginBottom:8}}>scale {presserScale.toFixed(2)}</p>
          <p style={s}>tap</p>
          <p style={{...s, color:"#22d3ee", marginBottom:1}}>pos [{tapPos.map(v=>v.toFixed(2)).join(", ")}]</p>
          <p style={{...s, color:"#22d3ee", marginBottom:1}}>rot [{tapRot.map(v=>v.toFixed(2)).join(", ")}]</p>
          <p style={{...s, color:"#f59e0b"}}>scale {tapScale.toFixed(2)}</p>
        </div>
      </div>

      {/* ── 3D Viewport ── */}
      <div ref={containerRef} style={{ flex:1, position:"relative" }}>
        <Canvas key={canvasKey} camera={{ position:[0,4,10], fov:50 }}
          gl={{ powerPreference:"high-performance", antialias:true }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5,10,5]} intensity={2} castShadow />
          <directionalLight position={[-5,-2,-5]} intensity={0.5} />
          <Environment preset="studio" />
          <React.Suspense fallback={null}>
            <PressAttachment pos={presserPos} rot={presserRot} scale={presserScale} />
            <TapModel        pos={tapPos}     rot={tapRot}     scale={tapScale} />
          </React.Suspense>
          {showGrid && <Grid args={[20,20]} cellColor="#2a2a2a" sectionColor="#3a3a3a" fadeDistance={20} />}
          <OrbitControls makeDefault />
        </Canvas>

        <div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
          fontSize:11, color:"#333", pointerEvents:"none" }}>
          Left drag to orbit · Right drag to pan · Scroll to zoom
        </div>
      </div>
    </div>
  )
}
