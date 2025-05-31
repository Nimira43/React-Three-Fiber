import './style.css'
import * as THREE from 'three/webgpu'
import { abs, clamp, cos, dot, Fn, length, max, mix, mod, negate, oneMinus, positionLocal, sin, smoothstep, step, time, vec2, vec3,
} from 'three/tsl'
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

//@ts-ignore
const Line = Fn(([position, direction, distance, thickness]) => {
  const projection = dot(position, direction) 
  const clampedProjection = clamp(projection, 0.0, distance)
  const line = smoothstep(
    thickness,
    0.0,
    length(position.sub(clampedProjection.mul(direction)))
  )
  return line
})

//@ts-ignore
const Circle = Fn(([position, radius, thickness]) => {
  const distance = length(position).sub(radius)
  return smoothstep(thickness, 0, abs(distance))
})

const main = Fn(() => {
  const p = positionLocal.toVar()
  p.mulAssign(2)

  const radius = 0.5
  const thickness = 0.02

  const circleOffset = vec2(-0.66, 0.66)
  const circle = Circle(p.sub(circleOffset), radius, thickness)

  const angle = time
  const direction = vec2(cos(angle), sin(angle))

  const radiusLine = Line(p.sub(circleOffset), direction, radius, thickness)
  const radiusEndPosition = direction.mul(radius)

  const frequency = Math.PI * 2

  const sineWave = smoothstep(
    thickness,
    0,
    abs(
      p.y
        .sub(circleOffset.y)
        .sub(sin(p.x.mul(frequency).sub(time).sub(Math.PI)).mul(0.5))
    )
  ) // offset it
  sineWave.assign(step(0, p.x).mul(sineWave)) 

  const cosineWave = smoothstep(
    thickness,
    0,
    abs(
      p.x.sub(circleOffset.x).sub(cos(p.y.mul(frequency).add(time)).mul(0.5))
    )
  ) // offset it
  cosineWave.assign(step(p.y, 0).mul(cosineWave)) 

  const sineReferenceLine = Line(
    p.sub(circleOffset).sub(radiusEndPosition),
    vec2(1, 0),
    negate(radiusEndPosition.x).sub(circleOffset.x),
    thickness
  )
  const cosineReferenceLine = Line(
    p.sub(circleOffset).sub(radiusEndPosition),
    vec2(0, -1),
    radiusEndPosition.y.add(circleOffset.y),
    thickness
  )

  const dottedSineReferenceLine = sineReferenceLine.mul(
    step(0.5, mod(p.x.mul(10), 1))
  )

  const dottedCosineReferenceLine = cosineReferenceLine.mul(
    step(0.5, mod(p.y.mul(10), 1))
  )

  const finalColour = mix(circle, vec3(1, 1, 0), radiusLine)
  finalColour.assign(mix(finalColour, vec3(1, 0, 0), sineWave))
  finalColour.assign(mix(finalColour, vec3(0, 1, 0), cosineWave))
  finalColour.assign(mix(finalColour, vec3(1, 1, 0), dottedSineReferenceLine))
  finalColour.assign(
    mix(finalColour, vec3(1, 1, 0), dottedCosineReferenceLine)
  )

  return finalColour
})

const material = new THREE.NodeMaterial()
material.fragmentNode = main()

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
scene.add(mesh)

function animate() {
  controls.update()
  renderer.render(scene, camera)
}