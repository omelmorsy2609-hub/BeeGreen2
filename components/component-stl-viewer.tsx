"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { STLLoader } from "three/addons/loaders/STLLoader.js"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

export interface ComponentMeshData {
  id: string
  buffer: ArrayBuffer
}

interface ComponentStlViewerProps {
  components: ComponentMeshData[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Bump this when a brand-new model is generated to re-frame the camera. Editing a part shouldn't move the camera. */
  resetKey?: string | number
  className?: string
}

const BASE_COLOR = 0x22c55e
const SELECTED_COLOR = 0xf59e0b

// Renders each model component as its own Mesh (tagged via
// mesh.userData.componentId) instead of one merged mesh, so individual
// parts can be raycast-picked and highlighted. See lib/model-spec.ts for
// why a merged STL can't reliably be mapped back to semantic parts.
export function ComponentStlViewer({
  components,
  selectedId,
  onSelect,
  resetKey,
  className,
}: ComponentStlViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Mount once: scene / camera / renderer / controls / picking.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 1
    const height = container.clientHeight || 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    const directional = new THREE.DirectionalLight(0xffffff, 0.9)
    directional.position.set(1, 1, 1)
    scene.add(ambient, directional)

    const group = new THREE.Group()
    scene.add(group)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls
    groupRef.current = group

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let downPos: { x: number; y: number } | null = null

    const handlePointerDown = (event: PointerEvent) => {
      downPos = { x: event.clientX, y: event.clientY }
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!downPos) return
      const moved = Math.hypot(event.clientX - downPos.x, event.clientY - downPos.y)
      downPos = null
      if (moved > 4) return // an orbit drag, not a click

      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(group.children, false)[0]
      onSelectRef.current(hit ? (hit.object.userData.componentId as string) : null)
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown)
    renderer.domElement.addEventListener("pointerup", handlePointerUp)

    let frameId: number
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", handleResize)
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown)
      renderer.domElement.removeEventListener("pointerup", handlePointerUp)
      controls.dispose()
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          ;(child.material as THREE.Material).dispose()
        }
      })
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      controlsRef.current = null
      groupRef.current = null
    }
  }, [])

  // Rebuild meshes whenever the component buffers change (new model, or a
  // part's dimensions were edited).
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    group.children.slice().forEach((child) => {
      group.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      }
    })

    const loader = new STLLoader()
    for (const { id, buffer } of components) {
      try {
        const geometry = loader.parse(buffer)
        geometry.computeVertexNormals()
        const material = new THREE.MeshStandardMaterial({
          color: id === selectedId ? SELECTED_COLOR : BASE_COLOR,
          metalness: 0.1,
          roughness: 0.5,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.userData.componentId = id
        group.add(mesh)
      } catch {
        // Skip a part that failed to parse rather than breaking the whole viewer.
      }
    }
    // selectedId is intentionally read here only for initial coloring; the
    // dedicated effect below keeps re-coloring in sync on later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components])

  // Re-color meshes on selection change, without rebuilding geometry.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial
        material.color.set(child.userData.componentId === selectedId ? SELECTED_COLOR : BASE_COLOR)
      }
    })
  }, [selectedId])

  // Frame the camera around the full assembly only when a new model is
  // generated (resetKey changes) — never on a per-part edit.
  useEffect(() => {
    const group = groupRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!group || !camera || !controls || group.children.length === 0) return

    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3()).length() || 1
    const center = box.getCenter(new THREE.Vector3())

    camera.position.set(center.x + size / 1.5, center.y + size / 2.5, center.z + size / 1.5)
    camera.lookAt(center)
    controls.target.copy(center)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  return <div ref={containerRef} className={className} />
}
