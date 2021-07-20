import AABBShape from './AABBShape'
export default class Block extends AABBShape {
  instance = null
  constructor() {
    super({
      size: [2, 2, 2],
      center: [1, 1, 1],
    })
  }
}
