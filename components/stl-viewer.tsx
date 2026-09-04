"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { STLLoader } from "three/addons/loaders/STLLoader.js"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

interface StlViewerProps {
  stlBuffer: ArrayBuffer
  className?: string
}

export function StlViewer({ stlBuffer, className }: StlViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

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

    const loader = new STLLoader()
    const geometry = loader.parse(stlBuffer)
    geometry.center()
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.1,
      roughness: 0.5,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Frame the camera around the model.
    const box = new THREE.Box3().setFromObject(mesh)
    const size = box.getSize(new THREE.Vector3()).length() || 1
    const center = box.getCenter(new THREE.Vector3())

    camera.position.set(center.x + size / 1.5, center.y + size / 2.5, center.z + size / 1.5)
    camera.lookAt(center)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(center)
    controls.enableDamping = true

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
      controls.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [stlBuffer])

  return <div ref={containerRef} className={className} />
}
