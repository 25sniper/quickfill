import React, {
  useRef, useMemo, useEffect, useState, useCallback
} from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls, Grid, useGLTF, Environment, TransformControls
} from "@react-three/drei"
import * as THREE from "three"

// ─────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────
export interface KF {
  t: number
  pos: [number, number, number]
  rot: [number, number, number]
  scale: number
}
interface MS { pos:[number,number,number]; rot:[number,number,number]; scale:number }

function lerp3(a:[number,number,number], b:[number,number,number], f:number):[number,number,number] {
  const L=THREE.MathUtils.lerp; return [L(a[0],b[0],f),L(a[1],b[1],f),L(a[2],b[2],f)]
}
function evalAt(kfs:KF[], t:number):MS {
  if(!kfs.length) return {pos:[0,0,0],rot:[0,0,0],scale:1}
  const s=[...kfs].sort((a,b)=>a.t-b.t)
  if(t<=s[0].t) return {pos:[...s[0].pos],rot:[...s[0].rot],scale:s[0].scale}
  const last=s[s.length-1]
  if(t>=last.t) return {pos:[...last.pos],rot:[...last.rot],scale:last.scale}
  for(let i=0;i<s.length-1;i++){
    if(t>=s[i].t&&t<=s[i+1].t){
      const f=(t-s[i].t)/(s[i+1].t-s[i].t)
      return {
        pos:lerp3(s[i].pos,s[i+1].pos,f),
        rot:lerp3(s[i].rot,s[i+1].rot,f),
        scale:THREE.MathUtils.lerp(s[i].scale,s[i+1].scale,f)
      }
    }
  }
  return {pos:[...last.pos],rot:[...last.rot],scale:last.scale}
}

// ─────────────────────────────────────────
// Build mesh helper
// ─────────────────────────────────────────
function buildMesh(scene:THREE.Object3D, base:number, mat:THREE.Material){
  const clone = scene.clone(true)
  const box   = new THREE.Box3().setFromObject(clone)
  const size  = box.getSize(new THREE.Vector3())
  const center= box.getCenter(new THREE.Vector3())
  const s     = base / Math.max(size.x,size.y,size.z)
  clone.scale.setScalar(s)
  clone.position.sub(center.multiplyScalar(s))
  clone.traverse(c=>{if((c as THREE.Mesh).isMesh)(c as THREE.Mesh).material=mat})
  return clone
}

// ─────────────────────────────────────────
// Scene component  (all 3-D logic lives here)
// ─────────────────────────────────────────
function Scene({
  pressState, tapState,
  selModel, setSelModel,
  transformMode,
  onDragEnd,
  orbitRef,
  showGrid
}:{
  pressState:MS; tapState:MS
  selModel:"press"|"tap"; setSelModel:(m:"press"|"tap")=>void
  transformMode:"translate"|"rotate"|"scale"
  onDragEnd:(pos:[number,number,number],rot:[number,number,number],scale:number)=>void
  orbitRef:React.RefObject<any>
  showGrid:boolean
}) {
  // Use state-based refs so React re-renders when nodes mount
  const [pressNode, setPressNode] = useState<THREE.Group|null>(null)
  const [tapNode,   setTapNode]   = useState<THREE.Group|null>(null)
  const tcRef  = useRef<any>(null)
  const dragRef= useRef(false)

  const { scene:ps } = useGLTF("/pwh.glb")
  const { scene:ts } = useGLTF("/tab.glb")

  const pressMesh = useMemo(()=>buildMesh(ps,3,new THREE.MeshPhysicalMaterial({
    color:"#d0d0d0",metalness:0.7,roughness:0.25,clearcoat:1,side:THREE.DoubleSide
  })),[ps])

  const tapMesh = useMemo(()=>buildMesh(ts,3.2,new THREE.MeshPhysicalMaterial({
    color:"#c8a44a",metalness:0.95,roughness:0.15,clearcoat:0.8,
    emissive:new THREE.Color("#3d2a00"),emissiveIntensity:0.4,side:THREE.DoubleSide
  })),[ts])

  // Wire TC dragging-changed event
  useEffect(()=>{
    const tc = tcRef.current
    if(!tc) return
    const handler=(e:any)=>{
      dragRef.current = e.value
      if(orbitRef.current) orbitRef.current.enabled = !e.value
      // When drag ends → write back final transform to keyframe
      if(!e.value){
        const node = selModel==="press" ? pressNode : tapNode
        if(node){
          onDragEnd(
            [node.position.x, node.position.y, node.position.z],
            [node.rotation.x, node.rotation.y, node.rotation.z],
            node.scale.x
          )
        }
      }
    }
    tc.addEventListener("dragging-changed", handler)
    return ()=>tc.removeEventListener("dragging-changed", handler)
  }, [tcRef.current, selModel, pressNode, tapNode, onDragEnd, orbitRef])

  // Apply evaluated state every frame — but STOP during drag
  useFrame(()=>{
    if(dragRef.current) return
    if(pressNode){
      pressNode.position.set(...pressState.pos)
      pressNode.rotation.set(...pressState.rot)
      pressNode.scale.setScalar(pressState.scale)
    }
    if(tapNode){
      tapNode.position.set(...tapState.pos)
      tapNode.rotation.set(...tapState.rot)
      tapNode.scale.setScalar(tapState.scale)
    }
  })

  const activeNode = selModel==="press" ? pressNode : tapNode

  return (
    <>
      <ambientLight intensity={1.5}/>
      <directionalLight position={[5,10,5]} intensity={2}/>
      <directionalLight position={[-5,-2,-5]} intensity={0.5}/>
      <Environment preset="warehouse"/>

      {/* Presser */}
      <group ref={setPressNode} onClick={e=>{e.stopPropagation();setSelModel("press")}}>
        <primitive object={pressMesh}/>
        <mesh visible={false}><boxGeometry args={[4,4,4]}/></mesh>
      </group>

      {/* Tap */}
      <group ref={setTapNode} onClick={e=>{e.stopPropagation();setSelModel("tap")}}>
        <primitive object={tapMesh}/>
        <mesh visible={false}><boxGeometry args={[4,4,4]}/></mesh>
      </group>

      {/* Gizmo — only mount when node is ready */}
      {activeNode && (
        <TransformControls
          ref={tcRef}
          object={activeNode}
          mode={transformMode}
        />
      )}

      {showGrid&&<Grid args={[20,20]} cellColor="#1a1a1a" sectionColor="#2a2a2a" fadeDistance={20}/>}
      <OrbitControls ref={orbitRef} makeDefault/>
    </>
  )
}

// ─────────────────────────────────────────
// Slider row
// ─────────────────────────────────────────
function SR({label,value,min,max,step,color="#22d3ee",onChange}:{
  label:string;value:number;min:number;max:number;step:number;color?:string
  onChange:(v:number)=>void
}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
      <span style={{width:20,fontSize:10,color:"#888",fontFamily:"monospace"}}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(parseFloat(e.target.value))}
        style={{flex:1,accentColor:color,height:3}}/>
      <input type="number" value={value.toFixed(2)} step={step}
        onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}}
        style={{width:54,fontSize:10,background:"#1a1a1a",border:"1px solid #444",
          borderRadius:3,padding:"1px 4px",color:"#fff",fontFamily:"monospace",textAlign:"right"}}/>
    </div>
  )
}

// ─────────────────────────────────────────
// Panel
// ─────────────────────────────────────────
function ModelEditor({title,color,kf,onChange}:{title:string;color:string;kf:KF;onChange:(k:KF)=>void}){
  const up=(p:Partial<KF>)=>onChange({...kf,...p})
  const setPos=(i:0|1|2,v:number)=>{const p=[...kf.pos] as [number,number,number];p[i]=v;up({pos:p})}
  const setRot=(i:0|1|2,v:number)=>{const r=[...kf.rot] as [number,number,number];r[i]=v;up({rot:r})}
  const LS:React.CSSProperties={fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2,margin:"8px 0 4px"}
  return (
    <div style={{background:"#111",border:`1px solid ${color}33`,borderRadius:10,padding:12}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
        <span style={{fontSize:12,fontWeight:700,color}}>{title}</span>
      </div>
      <p style={LS}>Size</p>
      <SR label="S" value={kf.scale} min={0.05} max={6} step={0.05} color="#f59e0b" onChange={v=>up({scale:v})}/>
      <p style={LS}>Position</p>
      {(["X","Y","Z"] as const).map((ax,i)=>(
        <SR key={ax} label={ax} value={kf.pos[i]} min={-8} max={8} step={0.05} color={color}
          onChange={v=>setPos(i as 0|1|2,v)}/>
      ))}
      <p style={LS}>Rotation (rad)</p>
      {(["X","Y","Z"] as const).map((ax,i)=>(
        <SR key={ax} label={ax} value={kf.rot[i]} min={-Math.PI} max={Math.PI} step={0.05} color={color}
          onChange={v=>setRot(i as 0|1|2,v)}/>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────
const DEF_PRESS:KF[]=[
  {t:0,   pos:[0,0,0],        rot:[Math.PI/3,0,0],                 scale:1},
  {t:0.5, pos:[-3,0,2.5],     rot:[Math.PI/4,Math.PI*4.5,0],       scale:1},
  {t:1,   pos:[-0.03,0.01,0], rot:[Math.PI/2,Math.PI*6,Math.PI/2], scale:3},
]
const DEF_TAP:KF[]=[
  {t:0,   pos:[0,0,0],rot:[0,0,0],scale:0  },
  {t:0.5, pos:[0,0,0],rot:[0,0,0],scale:0  },
  {t:0.6, pos:[0,0,0],rot:[0,0,0],scale:1.5},
  {t:1,   pos:[0,0,0],rot:[0,0,0],scale:1.5},
]

// ─────────────────────────────────────────
// Save / load helpers
// ─────────────────────────────────────────
const LS_KEY = "anim_studio_saves"

interface SaveSlot {
  name: string
  savedAt: string   // ISO timestamp
  pressKFs: KF[]
  tapKFs: KF[]
  duration: number
  speed: number
}

function readSlots(): SaveSlot[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") } catch { return [] }
}
function writeSlots(slots: SaveSlot[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(slots))
}
function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"})
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────
export default function AnimationStudio(){
  const [pressKFs,  setPressKFs]  = useState<KF[]>(DEF_PRESS)
  const [tapKFs,    setTapKFs]    = useState<KF[]>(DEF_TAP)
  const [currentT,  setCurrentT]  = useState(0)
  const [playing,   setPlaying]   = useState(false)
  const [loop,      setLoop]      = useState(true)
  const [speed,     setSpeed]     = useState(1)
  const [duration,  setDuration]  = useState(4)
  const [selModel,  setSelModel]  = useState<"press"|"tap">("press")
  const [selKFIdx,  setSelKFIdx]  = useState(0)
  const [tMode,     setTMode]     = useState<"translate"|"rotate"|"scale">("translate")
  const [showGrid,  setShowGrid]  = useState(true)
  const [canvasKey, setCanvasKey] = useState(0)
  // Save / load
  const [slots,        setSlots]       = useState<SaveSlot[]>(readSlots)
  const [saveInput,    setSaveInput]   = useState("")
  const [savedFlash,   setSavedFlash]  = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const orbitRef     = useRef<any>(null)
  const rafRef       = useRef(0)

  // WebGL recovery
  useEffect(()=>{
    const el=containerRef.current?.querySelector("canvas"); if(!el) return
    const fn=(e:Event)=>{e.preventDefault();setTimeout(()=>setCanvasKey(k=>k+1),500)}
    el.addEventListener("webglcontextlost",fn)
    return ()=>el.removeEventListener("webglcontextlost",fn)
  },[canvasKey])

  // Playback
  useEffect(()=>{
    if(!playing) return
    let last=performance.now()
    const tick=(now:number)=>{
      const dt=(now-last)/1000; last=now
      setCurrentT(t=>{
        let n=t+(dt/duration)*speed
        if(n>=1){if(loop)n=n%1;else{n=1;setPlaying(false)}}
        return n
      })
      rafRef.current=requestAnimationFrame(tick)
    }
    rafRef.current=requestAnimationFrame(tick)
    return ()=>cancelAnimationFrame(rafRef.current)
  },[playing,duration,speed,loop])

  const pressState=evalAt(pressKFs,currentT)
  const tapState  =evalAt(tapKFs,  currentT)
  const kfs    = selModel==="press"?pressKFs:tapKFs
  const setKFs = selModel==="press"?setPressKFs:setTapKFs
  const selKF  = kfs[selKFIdx]??kfs[0]

  const updateSelKF=useCallback((kf:KF)=>{
    setKFs(prev=>prev.map((k,i)=>i===selKFIdx?kf:k))
  },[selKFIdx,setKFs])

  // Called when gizmo drag ends — write final 3D transform into selected keyframe
  const onDragEnd=useCallback((
    pos:[number,number,number],
    rot:[number,number,number],
    scale:number
  )=>{
    if(!selKF) return
    updateSelKF({...selKF, pos, rot, scale})
  },[selKF,updateSelKF])

  const addKeyframe=()=>{
    const cur=evalAt(kfs,currentT)
    const nkf:KF={t:parseFloat(currentT.toFixed(3)),...cur}
    const next=[...kfs,nkf].sort((a,b)=>a.t-b.t)
    setKFs(next); setSelKFIdx(next.findIndex(k=>k.t===nkf.t))
  }
  const removeKeyframe=()=>{
    if(kfs.length<=1)return
    setKFs(prev=>prev.filter((_,i)=>i!==selKFIdx))
    setSelKFIdx(Math.max(0,selKFIdx-1))
  }
  const saveToSlot = () => {
    const name = saveInput.trim() || `Animation ${new Date().toLocaleTimeString()}`
    const slot: SaveSlot = {
      name, savedAt: new Date().toISOString(),
      pressKFs, tapKFs, duration, speed
    }
    const next = [slot, ...slots.filter(s => s.name !== name)].slice(0, 20)
    writeSlots(next); setSlots(next); setSaveInput("")
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500)
  }

  const loadSlot = (slot: SaveSlot) => {
    setPressKFs(slot.pressKFs); setTapKFs(slot.tapKFs)
    setDuration(slot.duration); setSpeed(slot.speed)
    setCurrentT(0); setSelKFIdx(0); setPlaying(false)
  }

  const deleteSlot = (name: string) => {
    const next = slots.filter(s => s.name !== name)
    writeSlots(next); setSlots(next)
  }

  const downloadAnim = () => {
    const slot: SaveSlot = {
      name: saveInput.trim() || "animation",
      savedAt: new Date().toISOString(),
      pressKFs, tapKFs, duration, speed
    }
    downloadJSON(slot, `${slot.name.replace(/\s+/g,"_")}.anim.json`)
  }

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const slot: SaveSlot = JSON.parse(ev.target?.result as string)
        setPressKFs(slot.pressKFs); setTapKFs(slot.tapKFs)
        setDuration(slot.duration ?? 4); setSpeed(slot.speed ?? 1)
        setCurrentT(0); setSelKFIdx(0); setPlaying(false)
        // Also add to slots list
        const next = [slot, ...slots.filter(s => s.name !== slot.name)].slice(0, 20)
        writeSlots(next); setSlots(next)
      } catch { alert("Invalid animation file") }
    }
    reader.readAsText(file)
    e.target.value = ""   // reset so same file can be re-imported
  }

  const exportCode=()=>{
    const fmt=(arr:KF[])=>arr.map(k=>
      `  { t:${k.t.toFixed(2)}, pos:[${k.pos.map(v=>v.toFixed(3)).join(",")}], rot:[${k.rot.map(v=>v.toFixed(3)).join(",")}], scale:${k.scale.toFixed(3)} }`
    ).join(",\n")
    const txt=`const PRESSER_KFS = [\n${fmt(pressKFs)}\n]\n\nconst TAP_KFS = [\n${fmt(tapKFs)}\n]`
    navigator.clipboard.writeText(txt).then(()=>alert("Copied!\n\n"+txt))
  }

  const tlRef=useRef<HTMLDivElement>(null)
  const scrub=(e:React.MouseEvent)=>{
    const r=tlRef.current!.getBoundingClientRect()
    setCurrentT(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)))
    setPlaying(false)
  }

  const BG="#0a0a0a"; const BRD="#1e1e1e"
  const RS:React.CSSProperties={fontFamily:"monospace",fontSize:10,color:"#888",margin:0}

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100vw",background:BG,color:"#fff",overflow:"hidden"}}>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* Left panel */}
        <div style={{width:272,flexShrink:0,display:"flex",flexDirection:"column",
          padding:12,overflowY:"auto",borderRight:`1px solid ${BRD}`,gap:8}}>

          <div>
            <h1 style={{fontSize:14,fontWeight:800,margin:"0 0 2px"}}>Animation Studio</h1>
            <p style={{fontSize:10,color:"#444",margin:0}}>Click model → drag gizmo axis. Sliders also work.</p>
          </div>

          {/* Model tabs */}
          <div style={{display:"flex",gap:4}}>
            {(["press","tap"] as const).map(m=>(
              <button key={m} onClick={()=>setSelModel(m)} style={{
                flex:1,padding:"5px 0",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",
                border:`1px solid ${m==="press"?"#aaa":"#c8a44a"}`,
                background:selModel===m?(m==="press"?"#aaa":"#c8a44a"):"transparent",
                color:selModel===m?"#000":(m==="press"?"#aaa":"#c8a44a")
              }}>{m==="press"?"Presser":"Tap"}</button>
            ))}
          </div>

          {/* Transform mode */}
          <div style={{display:"flex",gap:3}}>
            {(["translate","rotate","scale"] as const).map(m=>(
              <button key={m} onClick={()=>setTMode(m)} style={{
                flex:1,padding:"4px 0",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer",
                border:`1px solid ${tMode===m?"#22d3ee":"#333"}`,
                background:tMode===m?"#22d3ee22":"transparent",
                color:tMode===m?"#22d3ee":"#555"
              }}>
                {m==="translate"?"↔ Move":m==="rotate"?"↻ Rot":"⊞ Sc"}
              </button>
            ))}
          </div>

          {/* KF list */}
          <div style={{background:"#111",border:`1px solid ${BRD}`,borderRadius:8,padding:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>Keyframes</span>
              <div style={{display:"flex",gap:4}}>
                <button onClick={addKeyframe} style={{padding:"1px 8px",fontSize:10,background:"#22d3ee",color:"#000",border:"none",borderRadius:4,cursor:"pointer",fontWeight:700}}>+ Add</button>
                <button onClick={removeKeyframe} style={{padding:"1px 8px",fontSize:10,background:"#f87171",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontWeight:700}}>× Del</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:90,overflowY:"auto"}}>
              {kfs.map((kf,i)=>(
                <div key={i} onClick={()=>{setSelKFIdx(i);setCurrentT(kf.t);setPlaying(false)}}
                  style={{display:"flex",justifyContent:"space-between",padding:"3px 8px",
                    borderRadius:4,cursor:"pointer",
                    background:i===selKFIdx?"#222":"transparent",
                    border:i===selKFIdx?"1px solid #444":"1px solid transparent"}}>
                  <span style={{fontSize:10,fontFamily:"monospace",color:i===selKFIdx?"#fff":"#666"}}>KF {i+1}</span>
                  <span style={{fontSize:10,fontFamily:"monospace",color:"#22d3ee"}}>t={kf.t.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KF time */}
          {selKF&&(
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:10,color:"#555"}}>KF time (0–1):</span>
              <input type="number" min={0} max={1} step={0.01} value={selKF.t.toFixed(3)}
                onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))updateSelKF({...selKF,t:Math.max(0,Math.min(1,v))})}}
                style={{width:70,fontSize:11,background:"#1a1a1a",border:"1px solid #444",
                  borderRadius:4,padding:"2px 6px",color:"#22d3ee",fontFamily:"monospace",textAlign:"right"}}/>
            </div>
          )}

          {selKF&&(
            <ModelEditor
              title={selModel==="press"?"Presser":"Tap"}
              color={selModel==="press"?"#c0c0c0":"#c8a44a"}
              kf={selKF} onChange={updateSelKF}
            />
          )}

          {/* Readout */}
          <div style={{background:"#111",border:`1px solid ${BRD}`,borderRadius:8,padding:10}}>
            <p style={{...RS,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>t = {currentT.toFixed(3)}</p>
            <p style={RS}>presser s={pressState.scale.toFixed(2)} [{pressState.pos.map(v=>v.toFixed(1)).join(",")}]</p>
            <p style={RS}>tap s={tapState.scale.toFixed(2)} [{tapState.pos.map(v=>v.toFixed(1)).join(",")}]</p>
          </div>

          {/* ── Save / Load Panel ── */}
          <div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:10,padding:12,display:"flex",flexDirection:"column",gap:8}}>
            <span style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>Save / Load</span>

            {/* Name input + Save button */}
            <div style={{display:"flex",gap:4}}>
              <input
                value={saveInput} onChange={e=>setSaveInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveToSlot()}}
                placeholder="Name (optional)"
                style={{flex:1,fontSize:10,background:"#1a1a1a",border:"1px solid #333",borderRadius:5,
                  padding:"4px 8px",color:"#fff",fontFamily:"monospace",outline:"none"}}
              />
              <button onClick={saveToSlot} style={{
                padding:"4px 10px",borderRadius:5,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",
                background: savedFlash ? "#34d399" : "#22d3ee", color:"#000",
                transition:"background 0.3s"
              }}>
                {savedFlash ? "✓" : "💾"}
              </button>
            </div>

            {/* Saved slots list */}
            {slots.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:110,overflowY:"auto"}}>
                {slots.map((slot, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,
                    background:"#0d0d0d",borderRadius:5,padding:"4px 6px",border:"1px solid #222"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:10,color:"#ddd",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{slot.name}</p>
                      <p style={{fontSize:9,color:"#444",margin:0}}>{new Date(slot.savedAt).toLocaleString()}</p>
                    </div>
                    <button onClick={()=>loadSlot(slot)} title="Load" style={{
                      padding:"2px 6px",fontSize:10,background:"#22d3ee22",color:"#22d3ee",
                      border:"1px solid #22d3ee44",borderRadius:4,cursor:"pointer"}}>Load</button>
                    <button onClick={()=>deleteSlot(slot.name)} title="Delete" style={{
                      padding:"2px 6px",fontSize:10,background:"transparent",color:"#f87171",
                      border:"1px solid #f8717144",borderRadius:4,cursor:"pointer"}}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Download / Import row */}
            <div style={{display:"flex",gap:4}}>
              <button onClick={downloadAnim} title="Download as .json file" style={{
                flex:1,padding:"5px",borderRadius:5,border:"1px solid #444",background:"transparent",
                color:"#aaa",fontSize:10,cursor:"pointer"}}>
                ⬇ Download .json
              </button>
              <button onClick={()=>fileInputRef.current?.click()} title="Load from .json file" style={{
                flex:1,padding:"5px",borderRadius:5,border:"1px solid #444",background:"transparent",
                color:"#aaa",fontSize:10,cursor:"pointer"}}>
                ⬆ Import .json
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={importFile}
                style={{display:"none"}}/>
            </div>
          </div>

          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setShowGrid(g=>!g)} style={{flex:1,padding:"5px",borderRadius:6,border:"1px solid #333",background:"transparent",color:"#555",fontSize:11,cursor:"pointer"}}>
              {showGrid?"✓ ":""}Grid
            </button>
            <button onClick={exportCode} style={{flex:2,padding:"5px",borderRadius:6,background:"#1a1a1a",color:"#aaa",fontSize:10,cursor:"pointer",border:"1px solid #333"}}>
              {"</>"}  Export JSX
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div ref={containerRef} style={{flex:1,position:"relative"}}>
          <Canvas key={canvasKey} camera={{position:[0,4,10],fov:50}}
            gl={{powerPreference:"high-performance",antialias:true}}>
            <React.Suspense fallback={null}>
              <Scene
                pressState={pressState} tapState={tapState}
                selModel={selModel} setSelModel={setSelModel}
                transformMode={tMode}
                onDragEnd={onDragEnd}
                orbitRef={orbitRef}
                showGrid={showGrid}
              />
            </React.Suspense>
          </Canvas>

          {/* Overlay */}
          <div style={{position:"absolute",top:10,left:10,background:"#0009",borderRadius:6,
            padding:"3px 10px",fontSize:11,fontWeight:700,
            color:selModel==="press"?"#c0c0c0":"#c8a44a",pointerEvents:"none"}}>
            ● {selModel==="press"?"Presser":"Tap"} — {tMode}
          </div>
          <div style={{position:"absolute",top:10,right:14,fontFamily:"monospace",
            fontSize:18,fontWeight:800,color:"#22d3ee",opacity:0.5,pointerEvents:"none"}}>
            {currentT.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{height:120,flexShrink:0,background:"#0d0d0d",borderTop:`1px solid ${BRD}`,padding:"10px 16px",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>{setCurrentT(0);setPlaying(false)}} style={B()}>⏮</button>
          <button onClick={()=>setPlaying(p=>!p)} style={B("#22d3ee")}>{playing?"⏸ Pause":"▶ Play"}</button>
          <button onClick={()=>{setCurrentT(0);setPlaying(false)}} style={B()}>⏹</button>
          <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#555",cursor:"pointer"}}>
            <input type="checkbox" checked={loop} onChange={e=>setLoop(e.target.checked)}/>Loop
          </label>
          <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:6}}>
            <span style={{fontSize:10,color:"#444"}}>Speed</span>
            <input type="range" min={0.1} max={4} step={0.1} value={speed}
              onChange={e=>setSpeed(parseFloat(e.target.value))} style={{width:70,accentColor:"#a78bfa"}}/>
            <span style={{fontSize:11,fontFamily:"monospace",color:"#a78bfa"}}>{speed.toFixed(1)}×</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:10,color:"#444"}}>Duration</span>
            <input type="range" min={1} max={20} step={0.5} value={duration}
              onChange={e=>setDuration(parseFloat(e.target.value))} style={{width:70,accentColor:"#34d399"}}/>
            <span style={{fontSize:11,fontFamily:"monospace",color:"#34d399"}}>{duration.toFixed(1)}s</span>
          </div>
        </div>

        <div ref={tlRef} onClick={scrub} onMouseMove={e=>{if(e.buttons===1)scrub(e)}}
          style={{position:"relative",height:44,background:"#111",borderRadius:8,
            border:"1px solid #1e1e1e",cursor:"crosshair",userSelect:"none",overflow:"hidden"}}>
          {Array.from({length:11},(_,i)=>(
            <React.Fragment key={i}>
              <div style={{position:"absolute",left:`${i*10}%`,top:0,bottom:0,borderLeft:"1px solid #1a1a1a",pointerEvents:"none"}}/>
              <span style={{position:"absolute",left:`${i*10}%`,bottom:2,fontSize:9,color:"#2a2a2a",
                fontFamily:"monospace",transform:"translateX(-50%)",pointerEvents:"none"}}>
                {(i/10).toFixed(1)}
              </span>
            </React.Fragment>
          ))}
          {/* Presser lane */}
          <div style={{position:"absolute",top:4,left:0,right:0,height:12,background:"#ffffff05"}}>
            <span style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#3a3a3a"}}>Presser</span>
            {pressKFs.map((kf,i)=>(
              <div key={i} onClick={e=>{e.stopPropagation();setSelModel("press");setSelKFIdx(i);setCurrentT(kf.t);setPlaying(false)}}
                style={{position:"absolute",left:`${kf.t*100}%`,top:"50%",transform:"translate(-50%,-50%)",
                  width:10,height:10,borderRadius:"50%",background:"#c0c0c0",border:"2px solid #fff3",cursor:"pointer",zIndex:10}}/>
            ))}
          </div>
          {/* Tap lane */}
          <div style={{position:"absolute",top:20,left:0,right:0,height:12,background:"#ffffff03"}}>
            <span style={{position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#3a3a3a"}}>Tap</span>
            {tapKFs.map((kf,i)=>(
              <div key={i} onClick={e=>{e.stopPropagation();setSelModel("tap");setSelKFIdx(i);setCurrentT(kf.t);setPlaying(false)}}
                style={{position:"absolute",left:`${kf.t*100}%`,top:"50%",transform:"translate(-50%,-50%)",
                  width:10,height:10,borderRadius:"50%",background:"#c8a44a",border:"2px solid #fff3",cursor:"pointer",zIndex:10}}/>
            ))}
          </div>
          {/* Playhead */}
          <div style={{position:"absolute",top:0,bottom:0,left:`${currentT*100}%`,
            width:2,background:"#22d3ee",pointerEvents:"none",zIndex:20,boxShadow:"0 0 5px #22d3ee"}}>
            <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",
              width:8,height:8,borderRadius:"50%",background:"#22d3ee"}}/>
          </div>
        </div>
      </div>
    </div>
  )
}

function B(accent?:string):React.CSSProperties{
  return{padding:"5px 12px",borderRadius:6,border:`1px solid ${accent||"#333"}`,
    background:accent?accent+"22":"transparent",color:accent||"#888",fontSize:12,fontWeight:700,cursor:"pointer"}
}
