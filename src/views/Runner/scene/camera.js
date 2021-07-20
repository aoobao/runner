import { getConfig } from '../settings'
import { THREE } from '../utils'

export default class Camera {
  instance = null
  target = new THREE.Vector3(0, 0, 0)
  constructor(opts) {
    this.init(opts)
  }
  init() {
    const config = getConfig()
    const aspect = config.width / config.height

    this.instance = new THREE.PerspectiveCamera(config.fov, aspect, config.near, config.far)

    this.instance.position.set(...config.resetPosition)
    this.instance.lookAt(this.target)
  }

  setPosition(x, y, z) {
    this.instance.position.set(x, y, z)
  }

  lookAt(target) {
    this.instance.lookAt(target)
  }

  reset() {
    const config = getConfig()
    this.instance.position.set(...config.resetPosition)
    this.target = new THREE.Vector3(0, 0, 0)
    this.instance.lookAt(this.target)
  }
}
