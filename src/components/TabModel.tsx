import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function TabModel() {
  const { scene } = useGLTF('/tab-v1.glb')
  
  const clone = useMemo(() => {
    const clonedScene = scene.clone()
    
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    
    // Scale so the tap fits perfectly inside the attachment
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 3.2 / maxDim
    clonedScene.scale.setScalar(scale)
    
    // Center it
    clonedScene.position.sub(center.multiplyScalar(scale))
    
    // Warm polished brass — highly visible against dark background
    const material = new THREE.MeshPhysicalMaterial({
      color: '#c8a44a',        // warm gold
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      emissive: new THREE.Color('#3d2a00'),  // subtle warm glow so it reads in dark scenes
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    })
    
    clonedScene.traverse((child: any) => {
      if ((child as THREE.Mesh).isMesh) {
        ;(child as THREE.Mesh).material = material
      }
    })
    
    return clonedScene
  }, [scene])

  // Dispose GPU materials on unmount
  useEffect(() => {
    return () => {
      clone.traverse((child: any) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose())
          } else {
            mesh.material.dispose()
          }
        }
      })
    }
  }, [clone])

  return <primitive object={clone} />
}
