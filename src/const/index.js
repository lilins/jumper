export const STATUS = {
  READY: 0,
  CURRENT_SUCESS: 1,
  NEXT_SUCESS: 2,
  FAILURE_LEFTTOP_BOTTOM: -2,
  FAILURE_LEFTTOP_TOP: -3,
  FAILURE_RIGHTTOP_BOTTOM: -4,
  FAILURE_RIGHTTOP_TOP: -5,
  FAILURE_OVER_RANGE: -6
}
export const DIRECTION = {
  LEFTTOP: 1,
  RIGHTTOP: 2
}
export const FAILURE_TABLE = {
  [DIRECTION.LEFTTOP]: {
    [true]: STATUS.FAILURE_LEFTTOP_BOTTOM,
    [false]: STATUS.FAILURE_LEFTTOP_TOP
  },
  [DIRECTION.RIGHTTOP]: {
    [true]: STATUS.FAILURE_RIGHTTOP_TOP,
    [false]: STATUS.FAILURE_RIGHTTOP_BOTTOM
  }
}
export const FAILURE_ROTATION = 180
export const errMessage = { message: 'direction Arror' }
export const screenWidth = window.innerWidth
export const screenHeight = window.innerHeight
export const screenRatio = window.devicePixelRatio
export const cubeDefault = { width: 4, heigth: 2, depth: 4 }
export const playerDefault = { width: 1, heigth: 3, depth: 1 }
