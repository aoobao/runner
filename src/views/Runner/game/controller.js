import Stage from '../scene/stage'
import { getConfig } from '../settings'
import MainMenu from '../pages/main-menu'
import GameView from '../pages/game-view'
export default class Controller {
  stage = null
  currentGameState = null
  constructor(opt) {
    this.changeState = this.changeState.bind(this)

    const dom = opt.dom
    this.stage = new Stage({
      dom,
    })

    const config = getConfig()

    this.stage.addEventListener(config.PAGE_CHANGE, this.changeState)
  }

  // 初始化页面
  initPage() {
    const config = getConfig()
    this.changeState({
      pageName: config.MAIN_PAGE,
      // pageName: config.GAME_VIEW_PAGE,
    })
  }
  changeState({ pageName, options }) {
    const config = getConfig()
    // 销毁当前正在运行的页面
    this.disposeCurrentGameState()

    const data = {
      options,
      stage: this.stage,
    }

    switch (pageName) {
      case config.MAIN_PAGE:
        this.currentGameState = new MainMenu(data)
        break
      case config.GAME_VIEW_PAGE:
        this.currentGameState = new GameView(data)
        break
      default:
        throw new Error('unknown pageName:' + pageName)
    }
  }

  disposeCurrentGameState() {
    if (this.currentGameState !== null) {
      this.currentGameState.destroy()
      this.currentGameState = null
    }
  }

  destroy() {
    this.disposeCurrentGameState()
    this.stage.destroy()
  }
}
