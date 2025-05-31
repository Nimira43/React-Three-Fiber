import './style.css'
import * as THREE from 'three/webgpu'
import { Fn, positionLocal } from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10
)
camera.position.z = 1

const renderer = new THREE.WebGPURenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const main = Fn(() => {
  const p = positionLocal.toVar()
  return p
})

const material = new THREE.NodeMaterial()
material.fragmentNode = positionLocal.length().mul(15).fract().step(0.5)

const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material)
scene.add(mesh)

function animate() {
  controls.update()
  renderer.render(scene, camera)
}

