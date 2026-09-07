import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Model(props: React.ComponentProps<'group'>) {
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
    
    clonedScene.traverse((child: any) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: '#e0e0e0',
          metalness: 0.8,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          side: THREE.DoubleSide
        })
      }
    })
    
    return clonedScene
  }, [scene])

  // Dispose GPU materials when this component is unmounted
  useEffect(() => {
    return () => {
      scaledScene.traverse((child: any) => {
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
  }, [scaledScene])

  return (
    <group {...props} dispose={null}>
      <primitive object={scaledScene} />
    </group>
  )
}

useGLTF.preload('/pwh.glb')
