import * as THREE from 'three'

const cubeDefault = {
  width: 4, // 方块宽度
  heigth: 2, // 方块高度
  depth: 4, // 方块深度
}

export default class Jumper {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
      z: 0
    }
    this.player = null
    this.cubeList = []
    this.cubeCount = 0
    this.readyJump = {
      flag: false,
      xSpeed: 0,
      ySpeed: 0,
      rotationDegree: 360
    }
    this.animation = {
      flag: false
    }
    this.cameraPos = {
      current: new THREE.Vector3(0, 0, 0),
      next: new THREE.Vector3()
    }
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.num = 80
    this.flag = true
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x555555)
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
    this.camera = new THREE.OrthographicCamera(this.width / (this.num * -1), this.width / this.num, this.height / this.num, this.height / (this.num * -1), 0, 5000)
    this.directLight = new THREE.DirectionalLight(0xffffff, 1.1)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3)

    this.renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({ antialias: true, alpha: true }) : new THREE.CanvasRenderer() // Fallback to canvas renderer, if necessary.
    this.renderer.setSize(window.innerWidth, window.innerHeight) // Set the size of the WebGL viewport.
    document.body.appendChild(this.renderer.domElement) // Append the WebGL viewport to the DOM.
    document.body.addEventListener('mousedown', this.handleDown)
    document.body.addEventListener('mouseup', this.handleUp)
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
  addPlayer () {
    this.player = this.addCube(0, 3, 0, { width: 1, heigth: 3, depth: 1 }, 0x555555, false)
  }
  addCube (x = this.cubeCount * 6, y = 0, z = 0, cubeCfg = cubeDefault, color = 0xffffff, player = true) {
    if (this.cubeList.length >= 6) {
      const shift = this.cubeList.shift()
      this.scene.remove(shift)
    }
    this.geometry = new THREE.BoxGeometry(cubeCfg.width, cubeCfg.heigth, cubeCfg.depth)
    this.material = new THREE.MeshLambertMaterial({ color })//new THREE.MeshLambertMaterial({ color: 0x00ffff } ) //new THREE.MeshStandardMaterial(0xffffff)
    // this.material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const cube = new THREE.Mesh(this.geometry, this.material)
    if (x !== undefined && y !== undefined && z !== undefined) {
      cube.position.set(x, y, z)
    }
    if(player){
      this.cubeList.push(cube)
      this.cubeCount ++
    }
    this.scene.add(cube)
    return cube
  }
  handleDown = () => {
    this.press()
  }
  handleUp = () => {
    this.readyJump.flag = true
    this.jump()
  }
  press = () => {
    if(this.readyJump.flag || this.player.scale.y <= 0.02){
      return
    }else{
      this.player.scale.y -= 0.01
      this.readyJump.xSpeed += 0.004
      this.readyJump.ySpeed += 0.008
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
      requestAnimationFrame(this.press)
    }
  }
  jump = () => {
    if(this.player.position.y >= 3){
      this.player.position.x += this.readyJump.xSpeed
      this.player.position.y += this.readyJump.ySpeed
      if(this.readyJump.rotationDegree >= 0){
        this.player.rotation.z = Math.PI * (this.readyJump.rotationDegree / 360)
        this.readyJump.rotationDegree -= 30
      }
      if ( this.player.scale.y < 1 ) {
      	this.player.scale.y += 0.02
      }
      this.readyJump.ySpeed -= 0.02
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
      requestAnimationFrame(this.jump)
    }else{
      this.readyJump.xSpeed = 0
      this.readyJump.ySpeed = 0
      this.player.position.y = 3
      this.player.rotation.z = 0
      this.player.scale.y = 1
      this.readyJump.rotationDegree = 360
      this.readyJump.flag = false
      this.updateCeamraPos()
      this.moveCeamra()
      this.addCube()
      return
    }
  }
  checkInCube = () => {
    
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
    var pointR = new THREE.Vector3()
    pointR.x = (pointA.x + pointB.x) / 2
    pointR.y = 0
    pointR.z = (pointA.z + pointB.z) / 2
    this.cameraPos.next = pointR
  }
  moveCeamra = () => {
    if(this.cameraPos.current.x < this.cameraPos.next.x || this.cameraPos.current.z < this.cameraPos.next.z){
      this.cameraPos.current.x -= 0.1
      this.cameraPos.current.z -= 0.1
      console.log(this.cameraPos)
      if(this.cameraPos.current.x - this.cameraPos.next.x < 0.05){
        this.cameraPos.current.x = this.cameraPos.next.x
      }
      if(this.cameraPos.current.z - this.cameraPos.next.z < 0.05){
        this.cameraPos.current.z = this.cameraPos.next.z
      }
      // this.camera.position.set(this.cameraPos.current.x, 0, )
      console.log(this.cameraPos.current.x)
      this.camera.lookAt(new THREE.Vector3(this.cameraPos.current.x, 0, this.cameraPos.current.z))
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.moveCeamra)
    }
  }
  render = animation => {
    if(this.animation.flag && animation){
      animation()
      this.renderer.render(this.scene, this.camera) // Each time we change the position of the cube object, we must re-render it.
      requestAnimationFrame(this.render.bind(this))
    }else{
      return
    }
  }
  renderStatic () {
    this.renderer.render(this.scene, this.camera)
  }
}