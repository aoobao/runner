import BasePage from './base'
import { PAGE_NAME, GAME_EVENT_TYPE } from '../settings'
import { THREE } from '../utils'
import Runner from '../objects/runner'
import Road from '../objects/road'
// import { createAnimation } from '../objects/animation'
const targetPosition = { x: -0.32710115818624236, y: 5.36519237975822, z: -15.894879326940885 }
export default class GameView extends BasePage {
  score = null
  constructor(opts) {
    super(opts)
    this.render = this.render.bind(this)
    super.loading(PAGE_NAME.GAME_VIEW_PAGE)
  }

  loaded() {
    // console.log('game view loaded')
    // ground

    this.group = new THREE.Group()
    this.group.position.y = -10
    // this.group.rotateY(Math.PI)
    this.stage.scene.add(this.group)

    this.road = new Road({ group: this.group })

    this.addRunner()

    this.startAnimation()

    // 倒计时准备开始.
    this.stage.background.readyStart().then(() => {
      this.changeScore(0)
      this.runner.start()
    })

    this.stage.addEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this.render)

    this.stage.event.addSwipeEvent(this.swipeAction, this)
    super.endLoading()
  }

  restart() {
    // console.log('restart')
    this.stage.background.clear()

    this.target = { ...targetPosition }
    const runner = this.runner.instance
    this.runner.reset()
    this.stage.control.setLookAt(this.target.x, this.target.y, this.target.z, runner.position.x, runner.position.y, runner.position.z, true)

    this.road.reset()

    // 倒计时准备开始.
    this.stage.background.readyStart().then(() => {
      this.changeScore(0)
      this.runner.start()
    })
  }

  changeScore(score) {
    this.score = score

    const bg = this.stage.background
    bg.clearCanvas()

    const text = '得分:' + this.score
    const ctx = bg.ctx

    ctx.save()

    ctx.fillStyle = 'red'
    ctx.font = '40px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    ctx.fillText(text, 10, 20)

    ctx.restore()
  }

  startAnimation() {
    this.target = { ...targetPosition }
    const runner = this.runner.instance
    this.stage.control.setLookAt(this.target.x, this.target.y, this.target.z, runner.position.x, runner.position.y, runner.position.z, true)
  }

  addRunner() {
    this.runner = new Runner({ stage: this.stage })

    const runner = this.runner.instance

    this.group.add(runner)

    // this.stage.camera.instance.add(light2)
    // 切换照相机位置
    this.stage.control.setLookAt(2.866819101475316e-7, 55.533134850718554, -0.00005561879928201811, runner.position.x, runner.position.y, runner.position.z, false)

    // this.stage.camera.setPosition(0, 0, 10)
    // this.stage.camera.lookAt(this.group.position)
  }

  addOverButton() {
    if (!this.loader) {
      this.loader = new THREE.TextureLoader()
    }
    const background = this.stage.background
    const button = super.getFileById('restartButton')

    const btnMap = this.loader.load(button.path)

    const material = new THREE.SpriteMaterial({ map: btnMap })
    const sprite = new THREE.Sprite(material)

    sprite.name = 'reset'
    const width = this.width * 0.8
    const height = width * 0.3191919

    sprite.center.set(0.5, 0, 0)
    sprite.scale.set(width, height, 1)
    sprite.position.set(0, 0, 1)

    background.scene.add(sprite)

    // add tap event
    background.event.addTouchEvent(sprite, this.restart, this)
  }

  swipeAction(e) {
    // console.log(e)
    switch (e.type) {
      case 'swipeleft':
        this.runner.trunLeft()
        break
      case 'swiperight':
        this.runner.trunRight()
        break
      case 'swipeup':
        this.runner.jump()
        break
      default:
        break
    }
  }

  render() {
    // console.log(this.runner.instance.position, this.stage.camera.instance.position)
    const z = this.runner.instance.position.z

    if (z > 0) {
      // console.log(z)
      const targetZ = this.target.z + z
      this.stage.control.moveTo(this.target.x, this.target.y, targetZ, true)

      // 碰撞检测
      const intersects = this.road.intersects(this.runner)

      if (intersects.length) {
        // console.log(intersects)
        for (let i = 0; i < intersects.length; i++) {
          const item = intersects[i]
          if (item.type === 'fish') {
            this.changeScore(this.score + 1)
            item.object.visible = false
          } else if (item.type === 'block') {
            // debugger
            item.object.disable = true
            this.runner.death()

            this.addOverButton()
          }
        }
      }

      // 更新道路
      this.road.update(z)
    }
  }

  destroy() {
    this.stage.scene.clear()
    this.stage.removeEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this.render)
  }
}
