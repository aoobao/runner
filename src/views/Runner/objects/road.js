import { THREE } from '../utils'
import { getFileById } from '../assets/types'
import { Rand } from '../assets/Rand'
import { recoverModel, getRecoverModel } from '../assets/pool'
import AABBShape from './AABBShape'
// import AABBShape from './AABBShape'
// const testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
// const blockSize = [2, 4, 0.5]
// const fishSize = [2, 1, 0.5]
const blockAABBShape = new AABBShape({
  size: [2, 2.5, 0.5],
  center: [1, 0, 0.25],
})

const fishAABBShape = new AABBShape({
  size: [2, 1, 0.5],
  center: [1, 0.5, 0.25],
})

export default class Road {
  // stage = null
  group = null
  meshs = []
  barriers = []
  fishs = []
  front_road_length = 500 // 前方道路需要的长度
  back_road_length = 25 // 后方道路需要的长度
  mesh_front_length = 25 // 单个模型前方的长度
  mesh_back_length = 25 // 单个模型后方的长度
  step = 5
  rnd = new Rand()
  startBarrierZ = 30
  startFishZ = 30
  constructor({ group }) {
    this.group = group

    this.template = new THREE.Mesh(new THREE.PlaneGeometry(10, 50), new THREE.MeshPhongMaterial({ color: 0x666666 }))
    this.template.rotation.x = -Math.PI / 2

    const barrierTemp = getFileById('barrier').object
    barrierTemp.scale.set(0.016, 0.016, 0.016)
    barrierTemp.name = 'block'
    const m = barrierTemp.children[0]
    m.position.x = 60

    this.barrierTemp = barrierTemp

    // fish
    const fishTemp = getFileById('fish').object
    const f = fishTemp.children[0]
    f.name = 'fish'
    const scaleNumber = 0.05
    f.scale.set(scaleNumber, scaleNumber, scaleNumber)
    f.position.y = 1
    // f.position.z = 10

    this.fishTemp = f

    this.addRoad()
    this.addBarrier()
  }

  reset() {
    this.group.remove(...this.meshs, ...this.barriers, ...this.fishs)
    this.meshs = []
    this.barriers = []
    this.fishs = []

    this.startBarrierZ = 30
    this.startFishZ = 30

    this.addRoad()
    this.addBarrier()
  }

  addRoad(targetZ = 0) {
    let start = 0
    if (this.meshs.length) {
      start = this.meshs[this.meshs.length - 1].position.z + this.mesh_front_length
    }

    let z = start || -this.back_road_length
    const frontRoadLength = targetZ + this.front_road_length
    // console.log('road', frontRoadLength)
    while (z < frontRoadLength) {
      const mesh = getRecoverModel('road', () => {
        const m = this.template.clone()
        return m
      })
      mesh.position.z = z + this.mesh_back_length
      mesh.name = '道路' + mesh.position.z

      this.meshs.push(mesh)
      this.group.add(mesh)
      z += this.mesh_back_length + this.mesh_front_length
    }

    // this.group.add(...this.meshs)
  }
  addBarrier(targetZ = 0) {
    const frontRoadLength = targetZ + this.front_road_length
    // console.log('block', frontRoadLength)
    let z = this.startBarrierZ

    while (z < frontRoadLength) {
      const rnd = this.rnd.getNumber()
      if (rnd < 0.3) {
        const barrier = getRecoverModel('block', () => {
          return this.barrierTemp.clone()
        })
        barrier.disable = false
        // console.log('barrier=' + z)
        barrier.position.z = z
        const x = this.rnd.randByArray([-3, 0, 3])
        barrier.position.x = x
        this.barriers.push(barrier)
        this.group.add(barrier)

        // const box = blockAABBShape.getCube(barrier.position)
        // const helper = new THREE.Box3Helper(box, 0xffff00)
        // this.group.add(helper)

        z += this.step * 3
      } else if (rnd > 0.9) {
        // 创建N条鱼
        const n = this.rnd.randBetween(5, 20)
        const x = this.rnd.randByArray([-3, 0, 3])
        for (let i = 0; i < n; i++) {
          const fish = getRecoverModel('fish', () => {
            return this.fishTemp.clone()
          })

          fish.visible = true
          fish.position.z = z
          fish.position.x = x

          this.fishs.push(fish)
          this.group.add(fish)

          // const box = fishAABBShape.getCube(fish.position)
          // const helper = new THREE.Box3Helper(box, 0x00ff00)
          // this.group.add(helper)

          z += this.step * 0.5
        }

        z += this.step
      } else {
        z += this.step
      }
    }

    this.startBarrierZ = z
  }

  // 检测碰撞 返回碰撞到的物体数组
  intersects(runner) {
    // console.log(runner)
    const result = []
    const targetZ = runner.instance.position.z
    const box = runner.getCube(runner.instance.position)
    // // 按照z简单筛选出小于10米的物体,
    const fishs = this.fishs.filter(t => {
      if (!t.visible) return false
      const z = t.position.z
      return Math.abs(targetZ - z) < 10
    })

    for (let i = 0; i < fishs.length; i++) {
      const fish = fishs[i]
      // const box = fishAABBShape.getCube(fish.position)
      const intersect = fishAABBShape.detect(fish.position, box)
      if (intersect) {
        result.push({
          type: 'fish',
          object: fish,
        })
      }
    }

    const blocks = this.barriers.filter(t => {
      if (t.disable) return false
      const z = t.position.z
      return Math.abs(targetZ - z) < 10
    })

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const intersect = blockAABBShape.detect(block.position, box)
      if (intersect) {
        result.push({
          type: 'block',
          object: block,
        })
      }
    }

    return result
  }

  update(targetZ) {
    //
    const backRoadLength = targetZ + -this.back_road_length - 20

    // // 回收道路
    for (let i = this.meshs.length - 1; i >= 0; i--) {
      const mesh = this.meshs[i]
      const z = mesh.position.z
      // 如果模型的最前面小于需要铺设的最后方
      if (z + this.mesh_front_length < backRoadLength) {
        this.group.remove(mesh)
        this.meshs.splice(i, 1)

        recoverModel('road', mesh)
      }
    }

    // // 回收栏杆
    for (let i = this.barriers.length - 1; i >= 0; i--) {
      const barrier = this.barriers[i]
      const z = barrier.position.z
      // 如果模型的最前面小于需要铺设的最后方
      if (z < backRoadLength) {
        this.group.remove(barrier)
        this.barriers.splice(i, 1)

        recoverModel('block', barrier)
      }
    }

    // 回收鱼
    for (let i = 0; i < this.fishs.length; i++) {
      const fish = this.fishs[i]
      const z = fish.position.z
      // 如果模型的最前面小于需要铺设的最后方
      if (z < backRoadLength) {
        this.group.remove(fish)
        this.fishs.splice(i, 1)

        recoverModel('fish', fish)
      }
    }

    // // 补齐前方的道路
    this.addRoad(targetZ)
    this.addBarrier(targetZ)
  }
}
