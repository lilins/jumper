export default class AnimationController {
  constructor (self) {
    this.self = self
    this.requestId = undefined
    this.animationFlag = true
  }
  loop (animation) {
    if (this.animationFlag) {
      animation.call(this.self)
      this.requestId = window.requestAnimationFrame(this.loop.bind(this, animation))
    }
  }
  startLoop (animation = () => { }) {
    console.log('start', this.requestId)
    if (!this.requestId) {
      this.loop(animation)
    }
  }
  endLoop (cb) {
    if (this.requestId) {
      console.log(this.requestId)
      window.cancelAnimationFrame(this.requestId)
      this.requestId = undefined
      if (cb) {
        cb.call(this.self)
      }
    }
  }
}
