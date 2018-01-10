import * as THREE from 'three'

const cubeDefault = {
  width: 4, // 方块宽度
  heigth: 2, // 方块高度
  depth: 4, // 方块深度
}
const playerDefault = { width: 1, heigth: 3, depth: 1 }
const safeArea = cubeDefault.width / 2
const overArea = cubeDefault.width / 2 + playerDefault.width / 2
const STATUS = {
  READY: 0,
  CURRENT_SUCESS: 1,
  NEXT_SUCESS: 2,
  FAILURE_LEFTTOP_BOTTOM: -2,
  FAILURE_LEFTTOP_TOP: -3,
  FAILURE_RIGHTTOP_BOTTOM: -4,
  FAILURE_RIGHTTOP_TOP: -5,
  FAILURE_OVER_RANGE: -6
}
const DIRECTION = {
  LEFTTOP: 1,
  RIGHTTOP: 2
}
const FAILURE_TABLE = {
  [DIRECTION.LEFTTOP]: {
    [true]: STATUS.FAILURE_LEFTTOP_BOTTOM,
    [false]: STATUS.FAILURE_LEFTTOP_TOP
  },
  [DIRECTION.RIGHTTOP]: {
    [true]: STATUS.FAILURE_RIGHTTOP_TOP,
    [false]: STATUS.FAILURE_RIGHTTOP_BOTTOM
  },
}
const FAILURE_ROTATION = 180

export default class Jumper {
  constructor() {
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
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.num = 80
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x333333)
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
    this.camera = new THREE.OrthographicCamera(
      this.width / (this.num * -1),
      this.width / this.num,
      this.height / this.num,
      this.height / (this.num * -1),
      0, 5000
    )
    this.endFlag = false
    this.directLight = new THREE.DirectionalLight(0xffffff, 1.1)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    this.addScore = () => { }
    this.failCallBack = () => { }
    this.renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({ antialias: true, alpha: true }) : new THREE.CanvasRenderer() // Fallback to canvas renderer, if necessary.
    this.renderer.setSize(window.innerWidth, window.innerHeight) // Set the size of the WebGL viewport.
  }
  setLightPosition (x = 0, y = 0, z = 0) {
    this.light.position.set(x, y, z)
  }
  setCameraPositon (x = 0, y = 0, z = 0) {
    this.camera.position.set(x, y, z)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }
  addScene () {
    // this.scene.add(this.light)
    this.scene.add(this.directLight)
    this.scene.add(this.ambientLight)
  }
  setSucessFunction (cb) {
    if (cb) {
      this.addScore = cb
    }
  }
  setFailFunction (cb) {
    if (cb) {
      this.failCallBack = cb
    }
  }
  init () {
    this.directLight.position.set(3, 10, 5)
    this.addJumpCube()
    this.addJumpCube()
    this.addPlayer()
    this.setCameraPositon(-100, 100, 100)
    this.addScene()
    this.renderStatic()
  }
  addPlayer () {
    this.player = this.addCube(0, 2.5, 0, playerDefault, 0x555555)
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
        newCube = this.addCube(currentCube.position.x, 0, currentCube.position.z - distance)
      } else if (direction === DIRECTION.RIGHTTOP) {
        newCube = this.addCube(currentCube.position.x + distance, 0, currentCube.position.z)
      } else {
        throw ('direction Arror')
      }
    } else {
      newCube = this.addCube(0, 0, 0)
    }
    this.jumpDirection = direction
    this.cubeList.push(newCube)
  }
  addCube (x = 0, y = 0, z = 0, cubeCfg = cubeDefault, color = 0xffffff) {
    this.geometry = new THREE.BoxGeometry(cubeCfg.width, cubeCfg.heigth, cubeCfg.depth)
    this.material = new THREE.MeshLambertMaterial({ color })//new THREE.MeshLambertMaterial({ color: 0x00ffff } ) //new THREE.MeshStandardMaterial(0xffffff)
    // this.material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const cube = new THREE.Mesh(this.geometry, this.material)
    if (x !== undefined && y !== undefined && z !== undefined) {
      cube.position.set(x, y, z)
    }
    this.scene.add(cube)
    return cube
  }
  handleDown = () => {
    if(!this.endFlag){
      this.player.geometry.translate(0, 1.5, 0)
      this.player.position.y -= 1.5
      this.press()
    }
  }
  handleUp = () => {
    if(!this.endFlag){
      this.player.geometry.translate(0, -1.5, 0)
      this.player.position.y += 1.5
      this.readyJump.flag = true
      this.jump()
    }
  }
  press = () => {
    const { LEFTTOP, RIGHTTOP } = DIRECTION
    if (this.readyJump.flag || this.player.scale.y <= 0.02) {
      return
    } else {
      this.player.scale.y -= 0.01
      if (this.jumpDirection === LEFTTOP) {
        this.readyJump.zSpeed -= 0.004
      } else if (this.jumpDirection === RIGHTTOP) {
        this.readyJump.xSpeed += 0.004
      } else {
        throw ('direction error')
      }
      this.readyJump.ySpeed += 0.008
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
      requestAnimationFrame(this.press)
    }
  }
  jump = () => {
    const { LEFTTOP, RIGHTTOP } = DIRECTION

    if (this.player.position.y >= 2.5) {
      // 水平方向跳跃
      if (this.jumpDirection === LEFTTOP) {
        this.player.position.z += this.readyJump.zSpeed
      } else if (this.jumpDirection === RIGHTTOP) {
        this.player.position.x += this.readyJump.xSpeed
      } else {
        throw ('direction error')
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
      requestAnimationFrame(this.jump)
    } else {
      this.readyJump.xSpeed = 0
      this.readyJump.ySpeed = 0
      this.readyJump.zSpeed = 0
      this.player.position.y = 2.5
      this.player.rotation.z = 0
      this.player.scale.y = 1
      this.readyJump.rotationDegree = 360
      this.readyJump.flag = false
      this.afterJump()
      // this.player.geometry.translate(0, -1.5, 0)
      // this.player.position.y += 1.5
      return
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
      throw ('direction error')
    }
  }
  checkInCube = () => {
    const { CURRENT_SUCESS, NEXT_SUCESS, FAILURE_OVER_RANGE } = STATUS
    const currentCube = this.cubeList[this.cubeList.length - 2]
    const nextCube = this.cubeList[this.cubeList.length - 1]
    const player = this.player
    let distanceS
    let distanceL
    if (this.jumpDirection === DIRECTION.LEFTTOP) {
      distanceS = player.position.z - currentCube.position.z
      distanceL = player.position.z - nextCube.position.z
    } else {
      distanceS = player.position.x - currentCube.position.x
      distanceL = player.position.x - nextCube.position.x
    }
    if (Math.abs(distanceS) < Math.abs(distanceL)) {
      if (Math.abs(distanceS) < safeArea) {
        this.jumpStatus = CURRENT_SUCESS
      } else if (Math.abs(distanceS) < overArea) {
        this.jumpStatus = FAILURE_TABLE[this.jumpDirection][distanceS > 0]
      } else {
        this.jumpStatus = FAILURE_OVER_RANGE
      }
    } else {
      if (Math.abs(distanceL) < safeArea) {
        this.jumpStatus = NEXT_SUCESS
      } else if (Math.abs(distanceL) < overArea) {
        this.jumpStatus = FAILURE_TABLE[this.jumpDirection][distanceL > 0]
      } else {
        this.jumpStatus = FAILURE_OVER_RANGE
      }
    }

  }
  afterJump = () => {
    const { CURRENT_SUCESS, NEXT_SUCESS,
      FAILURE_LEFTTOP_BOTTOM, FAILURE_LEFTTOP_TOP,
      FAILURE_RIGHTTOP_BOTTOM, FAILURE_RIGHTTOP_TOP,
      FAILURE_OVER_RANGE } = STATUS
    this.checkInCube()
    if (this.jumpStatus === CURRENT_SUCESS) {
    } else if (this.jumpStatus === NEXT_SUCESS) {
      this.addJumpCube()
      this.updateCeamraPos()
      this.moveCeamra()
      this.addScore()
    } else {
      this.player.geometry.translate(0, 1.5, 0)
      this.player.position.y -= 1.5
      this.failureAnimation(this.jumpStatus)
      this.end()
      this.failCallBack()
    }
    this.renderStatic()
  }
  updateCeamraPos = () => {
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
  moveCeamra = () => {
    const { LEFTTOP, RIGHTTOP } = DIRECTION
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
      requestAnimationFrame(this.moveCeamra)
    }
  }
  failureAnimation = (status) => {
    const { CURRENT_SUCESS, NEXT_SUCESS,
      FAILURE_LEFTTOP_BOTTOM, FAILURE_LEFTTOP_TOP,
      FAILURE_RIGHTTOP_BOTTOM, FAILURE_RIGHTTOP_TOP,
      FAILURE_OVER_RANGE } = STATUS
    const rotation = this.failureConfig.rotation
    let degree = 0
    if (this.player.position.y > -1 && rotation > FAILURE_ROTATION * -1) {
      switch (status) {
        case FAILURE_OVER_RANGE:
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
      requestAnimationFrame(this.failureAnimation.bind(this, status))
    }
  }
  end = () => {
    this.endFlag = true
  }
  restart = () => {
    this.endFlag = false
    for(let item of this.cubeList){
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
  render = animation => {
    if (this.animation.flag && animation) {
      animation()
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
      requestAnimationFrame(this.render.bind(this))
    } else {
      return
    }
  }
  renderStatic () {
    this.renderer.render(this.scene, this.camera)
  }
}