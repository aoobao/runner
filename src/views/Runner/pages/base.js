import { getLoadFilesByPageId, isCacheFile } from '../assets/pageLoader'
import { getConfig, GAME_EVENT_TYPE } from '../settings'
export default class BasePage {
  stage = null
  options = null

  _loadTotal = 0
  _loadCount = 0
  _loadFiles = []
  constructor({ stage, options }) {
    this.stage = stage
    this.options = options
    this._loadCallback = this._loadCallback.bind(this)
    this._loadProgress = this._loadProgress.bind(this)
    this._loadError = this._loadError.bind(this)
    this._stageRender = this._stageRender.bind(this)

    const config = getConfig()
    this.width = config.width
    this.height = config.height
  }

  loading(pageId) {
    this.pageId = pageId

    const res = isCacheFile(pageId)
    if (res.cached) {
      this.needLoading = false
      return this._loadCallback({
        ...res,
      })
    }

    this.needLoading = true
    this.stage.addEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this._stageRender)

    // console.log(pageId, '加载资源')
    getLoadFilesByPageId(pageId, this._loadCallback, this._loadProgress, this._loadError)
  }

  // 关闭加载页面,在子类中主动调用.
  endLoading() {
    this.needLoading = false
  }

  // 根据id获取加载完的文字资源
  getFileById(id) {
    const file = this._loadFiles.find(t => t.id === id)
    return file
  }

  _loadCallback(e) {
    // console.log(e, '完成')
    // this._clearLoadEvent()
    this._loadFiles = e.list
    this._loadTotal = e.total
    this._loadCount = e.total

    typeof this.loaded === 'function' && this.loaded(e)
  }

  _loadProgress(e) {
    // console.log(e, '加载中')
    this._loadTotal = e.total
    this._loadCount = e.count
  }

  _loadError(err) {
    console.error(err)
    this._clearLoadEvent()
    alert('加载资源失败')
  }

  _stageRender() {
    // console.log(e)
    // console.log('background render ')
    if (this.stage && this.stage.background) {
      const bg = this.stage.background
      // console.log('draw load page')
      if (this.needLoading) {
        const percent = !this._loadTotal ? 0 : this._loadCount / this._loadTotal
        // console.log(percent)
        bg.drawLoadPage(percent)
      } else {
        bg.clearLoadPage()
        this._clearLoadEvent()
      }
    }
  }

  _clearLoadEvent() {
    this.stage.removeEventListener(GAME_EVENT_TYPE.SCENE_RENDER, this._stageRender)
  }

  destroy() {
    this._clearLoadEvent()
    this.stage.clear()
  }

  delay(second) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, second * 1000)
    })
  }
}
