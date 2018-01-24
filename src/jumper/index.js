import * as THREE from 'three'
import BasicScene from '../common/BasicScene'
import GameInfo from './gameInfo'
import AnimationController from '../common/AnimationController'
import { STATUS, DIRECTION, FAILURE_TABLE, FAILURE_ROTATION, errMessage, cubeDefault, playerDefault } from '../const/index'

const safeArea = cubeDefault.width / 2
const overArea = cubeDefault.width / 2 + playerDefault.width / 2

export default class Jumper extends BasicScene {
  constructor () {
    super()
    this.cubeList = []
    this.player = null
    this.readyJump = {
      flag: false,
      xSpeed: 0,
      ySpeed: 0,
      zSpeed: 0,
      rotationDegree: 360
    }
    this.jumpStatus = STATUS.READY
    this.jumpDirection = ''
    this.jumpDistance = 0
    this.failureConfig = {
      rotation: 0
    }
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
    this.endFlag = false
    this.score = 0
    this.addScore = () => { }
    this.failCallBack = () => { }
    this.gameBoard = new GameInfo()
    this.animationController = new AnimationController(this)
    // bind
    this.moveCeamra = this.moveCeamra.bind(this)
    this.press = this.press.bind(this)
    this.jump = this.jump.bind(this)
    this.failureAnimation = this.failureAnimation.bind(this)
    this.handleDown = this.handleDown.bind(this)
    this.handleUp = this.handleUp.bind(this)
  }
  setSucessFunction (cb) {
    if (cb) {
      this.addScore = () => {
        this.score++
        cb()
      }
    }
  }
  setFailFunction (cb) {
    if (cb) {
      this.failCallBack = () => {
        cb()
      }
    }
  }
  init () {
    this.directLight.position.set(3, 10, 5)
    this.addJumpCube()
    this.addJumpCube()
    this.addPlayer()
    super.setCameraPositon(-100, 100, 100)
    super.addLightToScene()
    this.updateCeamraPos()
    this.moveCeamra()
  }
  addPlayer () {
    this.player = super.addCube(0, 2.5, 0, playerDefault, 0x555555)
    // this.player.geometry.translate(0, 1.5, 0)
  }
  addJumpCube () {
    const direction = Math.random() > 0.5 ? DIRECTION.LEFTTOP : DIRECTION.RIGHTTOP
    const distance = Math.floor(Math.random() * (12 - 8) + 8)
    if (this.cubeList.length >= 6) {
      const shift = this.cubeList.shift()
      this.scene.remove(shift)
    }
    const currentCube = this.cubeList[this.cubeList.length - 1]
    let newCube
    if (currentCube) {
      if (direction === DIRECTION.LEFTTOP) {
        newCube = super.addCube(currentCube.position.x, 0, currentCube.position.z - distance)
      } else if (direction === DIRECTION.RIGHTTOP) {
        newCube = super.addCube(currentCube.position.x + distance, 0, currentCube.position.z)
      } else {
        throw (errMessage)
      }
    } else {
      newCube = super.addCube(0, 0, 0)
    }
    this.jumpDirection = direction
    this.cubeList.push(newCube)
  }
  handleDown () {
    if (!this.endFlag) {
      this.player.geometry.translate(0, 1.5, 0)
      this.player.position.y -= 1.5
      this.animationController.animationFlag = true
      this.animationController.startLoop(this.press)
    }
  }
  handleUp () {
    if (!this.endFlag) {
      this.animationController.animationFlag = false
      this.animationController.endLoop()
      this.player.geometry.translate(0, -1.5, 0)
      this.player.position.y += 1.5
      this.readyJump.flag = true
      this.animationController.animationFlag = true
      this.animationController.startLoop(this.jump)
    }
  }
  press () {
    const { LEFTTOP, RIGHTTOP } = DIRECTION
    if (this.readyJump.flag || this.player.scale.y <= 0.02) {
    } else {
      this.player.scale.y -= 0.01
      if (this.jumpDirection === LEFTTOP) {
        this.readyJump.zSpeed -= 0.006
      } else if (this.jumpDirection === RIGHTTOP) {
        this.readyJump.xSpeed += 0.006
      } else {
        throw (errMessage)
      }
      this.readyJump.ySpeed += 0.01
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
    }
  }
  jump () {
    const { LEFTTOP, RIGHTTOP } = DIRECTION
    if (this.player.position.y >= 2.5) {
      // 水平方向跳跃
      if (this.jumpDirection === LEFTTOP) {
        this.player.position.z += this.readyJump.zSpeed
      } else if (this.jumpDirection === RIGHTTOP) {
        this.player.position.x += this.readyJump.xSpeed
      } else {
        throw (errMessage)
      }
      // 水平方向修正
      this.horizontalFix()
      // 垂直方向跳跃
      this.player.position.y += this.readyJump.ySpeed
      // 跳跃时的旋转
      if ((this.readyJump.xSpeed >= 0.08 || this.readyJump.zSpeed <= -0.08) && this.readyJump.rotationDegree >= 0) {
        if (this.jumpDirection === LEFTTOP) {
          this.player.rotation.x = Math.PI * (this.readyJump.rotationDegree / 360)
        } else if (this.jumpDirection === RIGHTTOP) {
          this.player.rotation.z = Math.PI * (this.readyJump.rotationDegree / 360)
        } else {
        }
        this.readyJump.rotationDegree -= 30
      }
      // 恢复高度压缩
      if (this.player.scale.y < 1) {
        this.player.scale.y += 0.02
      }
      // 垂直方向下落
      this.readyJump.ySpeed -= 0.02
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
    } else {
      this.animationController.animationFlag = false
      this.animationController.endLoop()
      this.readyJump.xSpeed = 0
      this.readyJump.ySpeed = 0
      this.readyJump.zSpeed = 0
      this.player.position.y = 2.5
      this.player.rotation.z = 0
      this.player.scale.y = 1
      this.readyJump.rotationDegree = 360
      this.readyJump.flag = false
      // this.afterJump()
      // this.player.geometry.translate(0, -1.5, 0)
      // this.player.position.y += 1.5
    }
  }
  // 水平方向修正
  horizontalFix () {
    const { LEFTTOP, RIGHTTOP } = DIRECTION
    const currentCube = this.cubeList[this.cubeList.length - 1]
    const x = this.player.position.x - currentCube.position.x
    const z = this.player.position.z - currentCube.position.z
    if (this.jumpDirection === LEFTTOP) {
      if (Math.abs(x) !== 0) {
        this.player.position.x += x > 0 ? -0.05 : 0.05
      }
    } else if (this.jumpDirection === RIGHTTOP) {
      if (Math.abs(z) !== 0) {
        this.player.position.z += z > 0 ? -0.05 : 0.05
      }
    } else {
      throw (errMessage)
    }
  }
  checkInCube () {
    const { CURRENT_SUCESS, NEXT_SUCESS, FAILURE_OVER_RANGE } = STATUS
    const currentCube = this.cubeList[this.cubeList.length - 2]
    const nextCube = this.cubeList[this.cubeList.length - 1]
    const player = this.player
    let distanceS, distanceL, result
    if (this.jumpDirection === DIRECTION.LEFTTOP) {
      distanceS = player.position.z - currentCube.position.z
      distanceL = player.position.z - nextCube.position.z
    } else {
      distanceS = player.position.x - currentCube.position.x
      distanceL = player.position.x - nextCube.position.x
    }
    if (Math.abs(distanceS) < Math.abs(distanceL)) {
      if (Math.abs(distanceS) < safeArea) {
        result = CURRENT_SUCESS
      } else if (Math.abs(distanceS) < overArea) {
        result = FAILURE_TABLE[this.jumpDirection][distanceS > 0]
      } else {
        result = FAILURE_OVER_RANGE
      }
    } else {
      if (Math.abs(distanceL) < safeArea) {
        result = NEXT_SUCESS
      } else if (Math.abs(distanceL) < overArea) {
        result = FAILURE_TABLE[this.jumpDirection][distanceL > 0]
      } else {
        result = FAILURE_OVER_RANGE
      }
    }
    this.jumpStatus = result
  }
  afterJump () {
    const { CURRENT_SUCESS, NEXT_SUCESS } = STATUS
    this.checkInCube()
    console.log(11111, this.jumpStatus)
    if (this.jumpStatus === CURRENT_SUCESS) {
    } else if (this.jumpStatus === NEXT_SUCESS) {
      this.addJumpCube()
      this.updateCeamraPos()
      this.moveCeamra()
      this.addScore()
    } else {
      this.player.geometry.translate(0, 1.5, 0)
      this.player.position.y -= 1.5
      // this.startLoop(this.failureAnimation.bind(this))
      this.failureAnimationControl()
      this.end()
      this.failCallBack()
    }
    // this.renderStatic()
  }
  updateCeamraPos () {
    const currentCube = this.cubeList[this.cubeList.length - 2]
    const lastCube = this.cubeList[this.cubeList.length - 1]
    const pointA = {
      x: lastCube.position.x,
      z: lastCube.position.z
    }
    const pointB = {
      x: currentCube.position.x,
      z: currentCube.position.z
    }
    this.cameraLookAt.next = new THREE.Vector3(
      (pointA.x + pointB.x) / 2, 0,
      (pointA.z + pointB.z) / 2
    )
    this.cameraPos.next = new THREE.Vector3(
      this.cameraPos.current.x + Math.abs(pointB.x - pointA.x), 100,
      this.cameraPos.current.z - Math.abs(pointB.z - pointA.z)
    )
  }
  moveCeamra () {
    const [cX, cZ] = [this.cameraLookAt.current.x, this.cameraLookAt.current.z]
    const [cpX, cpZ] = [this.cameraPos.current.x, this.cameraPos.current.z]
    if (this.cameraLookAt.current.x < this.cameraLookAt.next.x || this.cameraLookAt.current.z > this.cameraLookAt.next.z) {
      // 相机观看位置调整
      this.cameraLookAt.current.x += 0.3
      this.cameraLookAt.current.z -= 0.3
      if (this.cameraLookAt.current.x - this.cameraLookAt.next.x > 0.05) {
        this.cameraLookAt.current.x = this.cameraLookAt.next.x
      }
      if (this.cameraLookAt.current.z - this.cameraLookAt.next.z < 0.05) {
        this.cameraLookAt.current.z = this.cameraLookAt.next.z
      }
      // 相机位置调整
      this.cameraPos.current.x += 0.3
      this.cameraPos.current.z -= 0.3
      if (this.cameraPos.current.x - this.cameraPos.next.x > 0.05) {
        this.cameraPos.current.x = this.cameraPos.next.x
      }
      if (this.cameraPos.current.z - this.cameraPos.next.z < 0.05) {
        this.cameraPos.current.z = this.cameraPos.next.z
      }
      this.camera.position.set(cpX, 100, cpZ)
      this.camera.lookAt(new THREE.Vector3(cX, 0, cZ))
      this.renderer.render(this.scene, this.camera)
      window.requestAnimationFrame(this.moveCeamra)
    }
  }
  failureAnimationControl () {
    this.animationController.animationFlag = true
    this.animationController.startLoop(this.failureAnimation)
  }
  failureAnimation () {
    const { FAILURE_LEFTTOP_BOTTOM, FAILURE_LEFTTOP_TOP,
      FAILURE_RIGHTTOP_BOTTOM, FAILURE_RIGHTTOP_TOP,
      FAILURE_OVER_RANGE } = STATUS
    const status = this.jumpStatus
    const rotation = this.failureConfig.rotation
    console.log(status, this.player.position.y)
    if (this.player.position.y > -1 && rotation > FAILURE_ROTATION * -1) {
      switch (status) {
        case FAILURE_OVER_RANGE:
          console.log(this.player)
          this.player.position.y -= 0.15
          break
        case FAILURE_LEFTTOP_BOTTOM:
          this.player.rotation.x = rotation > FAILURE_ROTATION * -1 ? Math.PI * (rotation * -1 / 360) : Math.PI * (FAILURE_ROTATION * -1 / 360)
          this.player.position.z += 0.05
          break
        case FAILURE_LEFTTOP_TOP:
          this.player.rotation.x = rotation > FAILURE_ROTATION * -1 ? Math.PI * (rotation / 360) : Math.PI * (FAILURE_ROTATION / 360)
          this.player.position.z -= 0.05
          break
        case FAILURE_RIGHTTOP_BOTTOM:
          this.player.rotation.z = rotation > FAILURE_ROTATION * -1 ? Math.PI * (rotation * -1 / 360) : Math.PI * (FAILURE_ROTATION / 360)
          this.player.position.x -= 0.05
          break
        case FAILURE_RIGHTTOP_TOP:
          this.player.rotation.z = rotation > FAILURE_ROTATION * -1 ? Math.PI * (rotation / 360) : Math.PI * (FAILURE_ROTATION * -1 / 360)
          this.player.position.x += 0.05
          break
        default:
      }
      if (status !== FAILURE_OVER_RANGE) {
        this.failureConfig.rotation -= 8
        this.player.position.y -= 0.05
      }
      this.renderer.render(this.scene, this.camera)
    } else {
      this.animationController.animationFlag = false
      this.animationController.endLoop(this.showGameBoard)
    }
  }
  showGameBoard () {
    this.gameBoard.renderGameOver(this.score)
    this.renderer.render(this.scene, this.camera)
    this.renderer.render(this.gameBoard.sceneHUD, this.gameBoard.cameraHUD)
  }
  end () {
    this.endFlag = true
  }
  restart () {
    this.endFlag = false
    for (let item of this.cubeList) {
      this.scene.remove(item)
    }
    this.scene.remove(this.player)
    this.cubeList = []
    this.player = null
    this.readyJump = {
      flag: false,
      xSpeed: 0,
      ySpeed: 0,
      zSpeed: 0,
      rotationDegree: 360
    }
    this.cameraPos = {
      current: new THREE.Vector3(-100, 100, 100),
      next: new THREE.Vector3()
    }
    this.cameraLookAt = {
      current: new THREE.Vector3(0, 0, 0),
      next: new THREE.Vector3()
    }
    this.jumpStatus = STATUS.READY
    this.jumpDirection = ''
    this.jumpDistance = 0
    this.failureConfig = {
      rotation: 0
    }
    this.init()
  }
}
