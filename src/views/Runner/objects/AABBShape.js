import { THREE } from '../utils'

export default class AABBShape {
  // _size = [2, 2, 2]
  // _center= [1, 1, 1]
  constructor({ size = [2, 2, 2], center = [1, 1, 1] }) {
    this._size = new THREE.Vector3(...size)
    this._center = new THREE.Vector3(...center)
  }

  // 根据坐标获取立方体
  getCube(position) {
    // const p = new THREE.Vector3(...position)
    const p = position || new THREE.Vector3()

    const box = new THREE.Box3()

    box.min.x = p.x - this._center.x
    box.min.y = p.y - this._center.y
    box.min.z = p.z - this._center.z

    box.max.x = p.x + this._size.x - this._center.x
    box.max.y = p.y + this._size.y - this._center.y
    box.max.z = p.z + this._size.z - this._center.z

    return box
  }

  detect(position, targetBox) {
    const box = this.getCube(position)

    const isIntersect =
      box.min.x < targetBox.max.x && box.min.y < targetBox.max.y && box.min.z < targetBox.max.z && targetBox.min.x < box.max.x && targetBox.min.y < box.max.y && targetBox.min.z < box.max.z

    return isIntersect
  }
}
