import Controller from './controller'
export default class Game {
  controller = null
  constructor(opts) {
    this.controller = new Controller(opts)
    this.controller.initPage()
  }

  destroy() {
    // TODO
    if (this.controller) {
      this.controller.destroy()
    }
  }
}
