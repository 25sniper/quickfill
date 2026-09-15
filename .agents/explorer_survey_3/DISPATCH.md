## 2026-09-10T14:59:39Z

Survey the 3D Scene, Performance, Code Quality, and Assets (addressing R4, R5, R6):
1. Deep-dive into ProductScene.tsx (and any related 3D components): Three.js / @react-three/fiber / @react-three/drei usage, Canvas configuration.
2. Analyze 3D performance: How is the scene currently loaded (eager vs lazy)? How are keyframes evaluated in the animation loop (memoized or re-evaluated every frame)? Is frustum culling enabled on meshes?
3. Identify magic numbers and structure of ProductScene.tsx: What constants/magic numbers exist (camera FOV, positions, lighting, material props, animation times)? How can ProductScene.tsx be split into logical sub-modules (e.g. Model, Lighting, CameraController, Effects)?
4. Inspect TypeScript typings: What types are `any` or missing? What interfaces/types need to be introduced?
5. Inspect static assets: What 3D models (.glb, .gltf), textures, images, fonts exist in the repo? What are their file sizes? Which ones are large static assets that need to be served from CDN? How is src/assets/ currently structured?
