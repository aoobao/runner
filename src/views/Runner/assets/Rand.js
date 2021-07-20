export class Rand {
  getNumber() {
    return Math.random()
  }

  randBetween(minNumber, maxNumber) {
    const num = parseInt((maxNumber - minNumber + 1) * Math.random())

    return minNumber + num
  }

  randByArray(list) {
    const num = this.randBetween(0, list.length - 1)

    return list[num]
  }
}
