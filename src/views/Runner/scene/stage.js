import { getConfig } from '../settings'
import { THREE } from '../utils'
import Camera from './camera'
import BackGround from '../objects/background'
import ScreenEvent from '../objects/ScreenEvent'
import TWEEN from '@tweenjs/tween.js'
import CameraControls from 'camera-controls'

CameraControls.install({ THREE: THREE })

// .addEventListener ( type : String, listener : Function ) : null
// .removeEventListener ( type : String, listener : Function ) : null
// .dispatchEvent ( event : Object ) : null
export default class Stage extends THREE.EventDispatcher {
  scene = new THREE.Scene()
  camera = new Camera()
  background = new BackGround()
  renderer = null
  event = null

  constructor(opts) {
    super()
    this.render = this.render.bind(this)
    this.init(opts)
  }

  init({ dom }) {
    this.clock = new THREE.Clock()
    this.event = new ScreenEvent({ camera: this.camera.instance })

    const config = getConfig()

    this.SCENE_RENDER_TYPE = config.SCENE_RENDER
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      precision: 'highp',
      // preserveDrawingBuffer: true,
      alpha: true,
    })

    this.renderer.setSize(config.width, config.height)
    dom.appendChild(this.renderer.domElement)

    this.control = new CameraControls(this.camera.instance, this.renderer.domElement)
    this.control.enabled = false

    this.renderer.autoClear = false // 多场景渲染 HUD
    // this.renderer.setClearColor(0xffffff, 1)

    this.addLight()

    this.render()
  }

  addLight() {
    // 环境光
    const light = new THREE.AmbientLight(0x404040, 1.8)
    light.name = 'ambient-light'
    this.scene.add(light)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
    hemiLight.position.set(0, 20, 0)
    this.scene.add(hemiLight)

    this.scene.add(this.camera.instance)
  }

  render(timer) {
    if (!this.timer) this.timer = timer
    this._tick = requestAnimationFrame(this.render)
    const tick = timer - this.timer

    const delta = this.clock.getDelta()

    if (delta > 1) {
      // 大于1秒的延迟这一帧抛弃(认定为其他界面切换过来)
      return
    }
    this.dispatchEvent({ type: this.SCENE_RENDER_TYPE, tick, delta, timer })

    TWEEN.update(timer)
    const isUpdated = this.control.update(delta)

    if (isUpdated) {
      // console.log({ ...this.camera.instance.position })
    }

    this.renderer.clear()
    this.renderer.render(this.scene, this.camera.instance)

    if (this.background) {
      this.renderer.clearDepth()
      const hudScene = this.background.scene
      const hudCamera = this.background.camera
      this.renderer.render(hudScene, hudCamera)
    }
  }

  clear(light = false) {
    this.event && this.event.clear()
    this.background && this.background.clear()
    this.scene && this.scene.clear()

    if (!light) {
      this.addLight()
    }
  }

  destroy() {
    const config = getConfig()
    cancelAnimationFrame(this._tick)

    this.event && this.event.destroy()
    this.background && this.background.destroy()

    this.scene.clear(true)

    config.dom.removeChild(this.renderer.domElement)
  }
}
