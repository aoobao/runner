import Game from './game/game'
import { setConfig } from './settings'
export default class Main {
  game = null
  constructor(opts) {
    const dom = opts.dom
    const width = dom.offsetWidth
    const height = dom.offsetHeight

    setConfig({ width, height, dom })

    this.game = new Game(opts)
  }

  destroy() {
    this.game && this.game.destroy()
  }
}
