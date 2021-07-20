import BasePage from './base'
import { THREE } from '../utils'
import { GAME_EVENT_TYPE, PAGE_NAME } from '../settings'

export default class MainMenu extends BasePage {
  constructor(opts) {
    super(opts)
    this.render = this.render.bind(this)
    // this.createHUDSprites = this.createHUDSprites.bind(this)
    super.loading(PAGE_NAME.MAIN_PAGE)
  }

  loaded() {
    // console.log('加载结束', e)
    this.loader = new THREE.TextureLoader()
    this.addLogo()
    this.addButton()
    this.stage.addEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this.render)

    // const textureLoader = new THREE.TextureLoader()

    // textureLoader.load('./sprite0.png', this.createHUDSprites)

    setTimeout(() => {
      super.endLoading()
    }, 500)
  }
  // createHUDSprites(texture) {
  //   // console.log(this, texture)
  //   const material = new THREE.SpriteMaterial({ map: texture })

  //   const width = material.map.image.width
  //   const height = material.map.image.height

  //   const spriteTL = new THREE.Sprite(material)
  //   spriteTL.center.set(0.0, 1.0)
  //   spriteTL.scale.set(width, height, 1)
  //   // console.log(this.width, this.height, 'screen')
  //   spriteTL.position.set(-this.width / 2, this.height / 2, 0)
  //   const background = this.stage.background

  //   background.scene.add(spriteTL)
  // }
  addLogo() {
    const background = this.stage.background
    const logo = super.getFileById('logo')
    const texture = this.loader.load(logo.path)
    // const texture = new THREE.Texture(logo.object)
    const material = new THREE.SpriteMaterial({ map: texture })

    const width = logo.object.width
    const height = logo.object.height
    // console.log(width, height)
    const sprite = new THREE.Sprite(material)

    const aspect = width / height
    // 左上角
    sprite.center.set(0.0, 1.0)
    sprite.scale.set(this.width, this.width / aspect, 1)
    // sprite.position.set(0, 0, 1)
    sprite.position.set(-this.width / 2, this.height / 2, 0)

    background.scene.add(sprite)
  }

  addButton() {
    const background = this.stage.background
    const button = super.getFileById('startButton')
    const btnMap = this.loader.load(button.path)

    const material = new THREE.SpriteMaterial({ map: btnMap })
    const sprite = new THREE.Sprite(material)
    sprite.name = 'startGame'
    // sprite.center.set(0.5, 0)
    const width = this.width * 0.8
    const height = width * 0.3191919

    // 中间下方
    sprite.center.set(0.5, 0, 0)
    sprite.scale.set(width, height, 1)
    sprite.position.set(0, -this.height / 2 + 50, 1)

    background.scene.add(sprite)

    // add tap event
    background.event.addTouchEvent(sprite, this.startGame, this)
  }

  startGame() {
    console.log(this, 'start game')
    this.stage.dispatchEvent({
      type: GAME_EVENT_TYPE.PAGE_CHANGE,
      pageName: PAGE_NAME.GAME_VIEW_PAGE,
      options: {
        entry: 'menu',
      },
    })
  }

  render() {
    // console.log(this, e)
  }

  destroy() {
    super.destroy()
    this.stage.removeEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this.render)
  }
}
