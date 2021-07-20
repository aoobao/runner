import TWEEN from '@tweenjs/tween.js'

export function createAnimation(from, to, duration, easing = TWEEN.Easing.Quadratic.Out) {
  // TWEEN.Easing.Quadratic.Out
  // TWEEN.Easing.Linear.None
  const tween = new TWEEN.Tween(from)
  tween.to(to, duration).easing(easing)

  tween.start()
  
  return tween
}
