import { getFileById } from '../assets/types'
import { GAME_EVENT_TYPE } from '../settings'
import { createAnimation } from '../objects/animation'
import { THREE } from '../utils'
import TWEEN from '@tweenjs/tween.js'
import AABBShape from './AABBShape'

const DEFAULT_SPEED = 60

export default class Runner extends AABBShape {
  instance = null
  activeAction = null
  previousAction = null
  actions = {}
  speed = 0 // 每秒跑10米
  upspeed = 0 // 向上速度
  isRunning = false
  isMove = false
  status = null

  constructor({ stage }) {
    super({
      size: [2, 5, 2],
      center: [1, 0, 1],
    })

    this.render = this.render.bind(this)
    this.stage = stage
    const runner = getFileById('runner')

    this.gltf = runner.object

    this.instance = this.gltf.scene

    // const box = this.getCube()
    // const helper = new THREE.Box3Helper(box, 0xff0000)

    // this.instance.add(helper)
    // this.stage.scene.add(helper)

    // const light = new THREE.DirectionalLight(0xffffff, 0.8)
    // light.position.set(0, 0, 10)
    // this.instance.add(light)

    this.initAction()
  }

  reset() {
    this.isRunning = false
    this.isMove = false
    this.upspeed = 0
    this.speed = 0
    this.status = null
    this.fadeToAction('Standing', 1)

    this.instance.position.z = 0
    this.instance.position.x = 0
    this.instance.position.y = 0
  }

  initAction() {
    const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
    const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']
    const actions = this.actions
    this.mixer = new THREE.AnimationMixer(this.instance)
    const animations = this.gltf.animations

    for (let i = 0; i < animations.length; i++) {
      const clip = animations[i]
      const action = this.mixer.clipAction(clip)

      actions[clip.name] = action

      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true
        action.loop = THREE.LoopOnce
      }
    }
  }

  // 死亡
  death() {
    this.status = 'death'
    this.isRunning = false
    this.fadeToAction('Death', 0.5)
  }

  fadeToAction(name, duration) {
    this.previousAction = this.activeAction
    this.activeAction = this.actions[name]

    if (this.previousAction && this.previousAction !== this.activeAction) {
      this.previousAction.fadeOut(duration)
    }

    this.activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play()
  }

  start() {
    this.isRunning = true
    this.stage.addEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this.render)
    this.run()
  }

  async run(duration = 0.5) {
    // const action = this.actions['Running'] ||

    console.log('run')

    this.status = 'run'
    this.fadeToAction('Running', duration)
    // await this.delay(0.5)

    createAnimation(this, { speed: DEFAULT_SPEED }, 3000)
    // this.isRunning = true
  }

  jump() {
    if (!this.isRunning || this.isMove) return
    this.isMove = true
    const runner = this.instance
    this.fadeToAction('Jump', 0.4)

    this.upspeed = 10

    // createAnimation(runner.position, { y: 5 }, 200)

    // createAnimation(this, { speed: 0 }, 400)

    const finishFun = () => {
      this.mixer.removeEventListener('finished', finishFun)
      const tween = createAnimation(runner.position, { y: 0 }, 200, TWEEN.Easing.Quadratic.InOut)
      tween.onComplete(() => {
        console.log('complete')
        if (this.status === 'run') {
          this.isMove = false
          // this.run(0.2)
          this.fadeToAction('Running', 0.2)
          // this.speed =
        }
      })
    }

    this.mixer.addEventListener('finished', finishFun)
  }

  trunLeft() {
    if (!this.isRunning || this.isMove) return
    const runner = this.instance
    // if(runner.position.position.x)
    if (runner.position.x < 3) {
      this.isMove = true

      let target = 0

      if (runner.position.x < 0) {
        target = 0
      } else {
        target = 3
      }

      const tween = createAnimation(runner.position, { x: target }, 100)
      tween.onComplete(() => {
        console.log('left')
        this.isMove = false
      })
    }
  }

  trunRight() {
    if (!this.isRunning || this.isMove) return
    const runner = this.instance
    if (runner.position.x > -3) {
      this.isMove = true
      let target = 0
      if (runner.position.x > 0) {
        target = 0
      } else {
        target = -3
      }

      const tween = createAnimation(runner.position, { x: target }, 100)

      tween.onComplete(() => {
        console.log('right')
        this.isMove = false
      })
    }
  }

  // isRunning() {
  //   return this.activeAction === this.actions['Running']
  // }

  render({ delta }) {
    // console.log(delta)  // 0.017 秒 / 帧
    if (this.isRunning) {
      const duration = this.speed * delta
      this.instance.position.z += duration

      if (this.upspeed !== 0 || this.instance.position.y !== 0) {
        if (!this.a) this.a = 10
        let height = this.instance.position.y
        // const a = 20

        const value = this.upspeed * delta

        height = height + value

        this.upspeed -= this.a * delta

        this.a += this.a * delta
        if (height < 0) {
          height = 0
          this.upspeed = 0
          this.a = 0
        }

        this.instance.position.y = height

        // console.log(height)
      }
    } else if (this.status === 'death') {
      // console.log('death')
    }

    if (this.mixer) {
      // console.log('mixer update')
      this.mixer.update(delta)
    }
  }

  destroy() {
    super.destroy()
    this.stage.removeEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this.render)
  }
}
