import { THREE } from '../utils'
import { getConfig } from '../settings'
export default class ScreenEvent {
  event = {
    tap: new Map(),
    // swiperight: new Map(),
    swipe: [],
  }
  _mouse = new THREE.Vector2()
  raycaster = new THREE.Raycaster()
  dom = null
  camera = null
  constructor(opt) {
    this._clickHandle = this._clickHandle.bind(this)
    this._start = this._start.bind(this)
    this._move = this._move.bind(this)
    this._end = this._end.bind(this)
    this.init(opt)
  }

  init({ camera, dom }) {
    // const config = getConfig()
    this.camera = camera

    // const dom = config.dom
    this._setDocument(dom)
    // this.dom.addEventListener('tap', this._clickHandle, false)
    this.dom.addEventListener('touchstart', this._start, false)
    this.dom.addEventListener('touchmove', this._move, false)
    this.dom.addEventListener('touchend', this._end, false)
  }

  _start(e) {
    e.preventDefault()
    this.vueMoves = false
    this.vueLeave = false
    this.longTouch = true
    // console.log(e)
    this.vueTouches = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    }
  }
  _move(e) {
    e.preventDefault()
    this.vueMoves = true
  }
  _end(e) {
    // 计算移动距离.
    const disX = e.changedTouches[0].pageX - this.vueTouches.x
    const disY = e.changedTouches[0].pageY - this.vueTouches.y
    const absX = Math.abs(disX)
    const absY = Math.abs(disY)
    let type = null
    if (absX > 10 || absY > 10) {
      if (absX > absY) {
        if (disX > 10) {
          // TODO
          type = 'swiperight'
        } else if (disX < 10) {
          type = 'swipeleft'
        }
      } else {
        if (disY > 10) {
          type = 'swipedown'
        } else if (disY < 10) {
          type = 'swipeup'
        }
      }

      if (type !== null) {
        const funcs = this.event.swipe
        // if (funcs.length > 0)
        funcs.forEach(obj => {
          const func = obj.func
          const caller = obj.caller
          func.call(caller, {
            type,
            disX,
            disY,
            start: this.vueTouches,
            end: {
              x: e.changedTouches[0].pageX,
              y: e.changedTouches[0].pageY,
            },
          })
        })
      }
    } else {
      this._mouseChangeHandle(e, 'click')
    }
  }

  _setDocument(dom) {
    if (!dom) {
      const config = getConfig()
      dom = config.dom
    }
    this.dom = dom
    this.width = this.dom.offsetWidth
    this.height = this.dom.offsetHeight
  }

  _clickHandle(e) {
    console.log(e, 'click')
    this._mouseChangeHandle(e, 'click')
  }

  _mouseChangeHandle(e, eventName) {
    this._updateMousePosition(e)

    return this._runIntersection(eventName)
  }

  _updateMousePosition(e) {
    // console.log(e)
    let x = e.offsetX || e.changedTouches[0].pageX
    let y = e.offsetY || e.changedTouches[0].pageY
    let dx = (x / this.width) * 2 - 1
    let dy = 1 - (y / this.height) * 2

    this._mouse.set(dx, dy)
  }

  _runIntersection() {
    // console.log(eventName)
    let isCheck = false
    const map = this.event.tap
    const intersects = this._checkIntersection()
    if (intersects.length > 0) {
      const activeObject = intersects[0].object
      const mapObject = getObjectInMap(map, activeObject)

      if (mapObject) {
        const funcs = map.get(mapObject)
        if (funcs.length > 0) isCheck = true
        funcs.forEach(obj => {
          const func = obj.func
          const caller = obj.caller
          func.call(caller, mapObject, intersects)
        })
      }
    }

    return isCheck
  }

  _checkIntersection() {
    const map = this.event.tap
    if (map.size === 0) return []

    const objects = getMapList(map)

    const mouse = this._mouse
    const camera = this.camera
    const raycaster = this.raycaster

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(objects, true)

    return intersects
  }

  addSwipeEvent(func, caller = null) {
    const funcs = this.event.swipe
    funcs.push({
      func,
      caller,
    })
  }

  removeSwipeEvent(func = null, caller = null) {
    if (!func) {
      this.event.swipe = []
    } else {
      const funcs = this.event.swipe
      for (let i = funcs.length - 1; i >= 0; i--) {
        const obj = funcs[i]
        if (obj.func === func && obj.caller === caller) {
          funcs.splice(i, 1)
        }
      }
    }
  }

  addTouchEvent(object3d, func, caller = null) {
    const map = this.event.tap
    let funcs
    if (map.has(object3d)) {
      funcs = map.get(object3d)
    } else {
      funcs = []
      map.set(object3d, funcs)
    }
    funcs.push({
      func,
      caller,
    })
  }

  // 移除点击事件
  removeTouchEvent(object3d = null, func = null, caller = null) {
    const map = this.event.tap
    if (object3d === null) {
      // 移除所有
      map.clear()
    } else {
      if (map.has(object3d)) {
        if (func === null) {
          // 参数2不传清空所有
          map.delete(object3d)
        } else {
          const funcs = map.get(object3d)
          for (let i = funcs.length - 1; i >= 0; i--) {
            const obj = funcs[i]
            if (obj.func === func && obj.caller === caller) {
              funcs.splice(i, 1)
            }
          }
          if (funcs.length === 0) {
            map.delete(object3d)
          }
        }
      }
    }
  }

  clear() {
    this.removeTouchEvent()
    this.removeSwipeEvent()
  }

  destroy() {
    this.clear()
    this.dom.removeEventListener('click', this._clickHandle, false)

    this.dom.removeEventListener('touchstart', this._start, false)
    this.dom.removeEventListener('touchmove', this._move, false)
    this.dom.removeEventListener('touchend', this._end, false)
  }
}

function getMapList(map) {
  let list = []
  for (let [key] of map.entries()) {
    list.push(key)
  }
  return list
}

// 存在点击捕获的对象是子对象,向上找到在map中存储的父对象
function getObjectInMap(map, object) {
  if (!object) {
    return null
  }
  if (map.has(object)) {
    return object
  } else {
    if (object.parent) {
      return getObjectInMap(map, object.parent)
    } else {
      return null
    }
  }
}
