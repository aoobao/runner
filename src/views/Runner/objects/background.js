import { getConfig } from '../settings'
import { THREE } from '../utils'
import ScreenEvent from './ScreenEvent'
import { getFileById } from '../assets/types'
import { createAnimation } from '../objects/animation'
import TWEEN from '@tweenjs/tween.js'
const CANVAS_NAME = 'canvas2d'
export default class BackGround {
  instance = null
  camera = null
  scene = null
  canvas = null
  ctx = null
  event = null
  width = 0
  height = 0
  renderFun = []
  constructor(opts) {
    this.init(opts)
  }
  init() {
    const config = getConfig()
    const width = config.width
    const height = config.height
    this.width = width
    this.height = height

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 100)

    this.camera.position.z = 100
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    this.event = new ScreenEvent({ camera: this.camera })

    const canvas = document.createElement('canvas')
    canvas.width = config.width
    canvas.height = config.height
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')

    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.minFilter = this.texture.magFilter = THREE.LinearFilter
    this.texture.needsUpdate = true

    this.geometry = new THREE.PlaneGeometry(config.width, config.height)
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.DoubleSide, transparent: true, opacity: 1 })

    this.instance = new THREE.Mesh(this.geometry, this.material)

    this.instance.position.set(0, 0, 9)

    this.instance.name = CANVAS_NAME

    this.scene.add(this.instance)
  }

  // render() {
  //   if (this.renderFun) {
  //     for (let i = 0; i < this.renderFun.length; i++) {
  //       const func = this.renderFun[i];
  //       func()
  //     }
  //   }
  // }

  destroy() {
    this.clear()
    this.event.destroy()
  }

  async readyStart() {
    let textMesh = this.createText('3')
    this.scene.add(textMesh)

    await this.delay(1)

    this.scene.remove(textMesh)
    textMesh = this.createText('2')
    this.scene.add(textMesh)

    await this.delay(1)

    this.scene.remove(textMesh)
    textMesh = this.createText('1')
    this.scene.add(textMesh)

    await this.delay(1)

    this.scene.remove(textMesh)
    textMesh = this.createText('Go')
    this.scene.add(textMesh)

    // debugger

    textMesh.material.transparent = true
    const tween = createAnimation(
      textMesh.material,
      {
        opacity: 0,
      },
      1000,
      TWEEN.Easing.Quadratic.Out,
    )

    // tween.onUpdate(e => {
    //   const opacity = e.opacity
    //   console.log(opacity)
    // })
    tween.onComplete(() => {
      this.scene.remove(textMesh)
    })

    // tween.start()

    return true
  }

  createText(text) {
    const font = getFileById('font')
    if (!this.textMaterial) {
      this.textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true })
    } else {
      this.textMaterial.opacity = 1
    }
    const textGeo = new THREE.TextGeometry(text, {
      font: font.object,
      size: 200,
      height: 1,
      curveSegments: 12,
      // bevelEnabled: true,
      // bevelThickness: 10,
      // bevelSize: 8,
      // bevelSegments: 5,
    })
    textGeo.computeBoundingBox()
    const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)

    const textMesh = new THREE.Mesh(textGeo, this.textMaterial)

    const height = this.height * 0.2

    textMesh.position.set(centerOffset, height, 0)
    // textMesh.rotation.z = Math.PI * 0.1
    textMesh.rotation.x = Math.PI * 0.1
    textMesh.rotation.y = Math.PI * 2

    return textMesh
  }

  /**
   * 绘制加载页面
   * @param {Number} percent
   */
  drawLoadPage(percent) {
    // console.log(percent, '进度条')

    this.clearCanvas()
    const ctx = this.ctx
    const width = this.width * 0.8
    const height = width * 0.2
    const left = (this.width - width) / 2
    const top = (this.height - height) / 2

    ctx.save()
    // 填充整个黑色
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 白框 红底 进度条 #d2354c

    // 先画进度条
    ctx.fillStyle = '#d2354c'
    const preWidth = width * percent
    ctx.beginPath()
    ctx.fillRect(left, top, preWidth, height)

    // 再画边框
    ctx.beginPath()
    ctx.strokeStyle = '#fff'
    ctx.rect(left, top, width, height)
    ctx.stroke()

    ctx.restore()
  }

  /**
   * 清除加载页面
   */
  clearLoadPage() {
    this.clearCanvas()
  }

  clear() {
    this.event.clear()

    this.clearCanvas()

    const children = this.scene.children.filter(c => {
      return c.name !== CANVAS_NAME
    })

    if (children.length) {
      this.scene.remove(...children)
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.texture.needsUpdate = true
  }

  delay(second) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, second * 1000)
    })
  }
}
