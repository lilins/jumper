import * as THREE from 'three'
import { screenWidth, screenHeight, screenRatio, cubeDefault } from '../const/index'

const textureLoader = new THREE.TextureLoader()
const sp = textureLoader.load('./sp2.jpg')

export default class BasicScene {
  constructor () {
    this.cameraPos = {
      current: new THREE.Vector3(-100, 100, 100),
      next: new THREE.Vector3()
    }
    this.cameraLookAt = {
      current: new THREE.Vector3(0, 0, 0),
      next: new THREE.Vector3()
    }
    this.width = screenWidth
    this.height = screenHeight
    this.ratio = screenRatio
    this.num = 40
    // three 设置
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x333333)
    this.directLight = new THREE.DirectionalLight(0xffffff, 1.1)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    this.camera = new THREE.OrthographicCamera(
      this.width / (this.num * -1),
      this.width / this.num,
      this.height / this.num,
      this.height / (this.num * -1),
      100, 5000
    )
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, maxLights: 1 }) // window.WebGLRenderingContext ? new THREE.WebGLRenderer({ antialias: true, alpha: true, maxLights:1 }) : new THREE.CanvasRenderer() // Fallback to canvas renderer, if necessary.
    this.renderer.autoClear = false
    this.renderer.setSize(screenWidth, screenHeight) // Set the size of the WebGL viewport.
    this.renderer.setPixelRatio(screenRatio)
  }
  setLightPosition (x = 0, y = 0, z = 0) {
    this.light.position.set(x, y, z)
  }
  setCameraPositon (x = 0, y = 0, z = 0) {
    this.camera.position.set(x, y, z)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
  }
  addLightToScene () {
    // this.scene.add(this.light)
    this.scene.add(this.directLight)
    this.scene.add(this.ambientLight)
  }
  addCube (x = 0, y = 0, z = 0, cubeCfg = cubeDefault, color = 0xffffff) {
    this.geometry = new THREE.CubeGeometry(cubeCfg.width, cubeCfg.heigth, cubeCfg.depth)
    // this.material = new THREE.MeshLambertMaterial({ color })// new THREE.MeshLambertMaterial({ color: 0x00ffff } ) //new THREE.MeshStandardMaterial(0xffffff)
    // this.material = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    this.material = new THREE.MeshPhongMaterial({ map: sp })
    // this.material = new THREE.MeshPhongMaterial({
    //   shininess: 80,
    //   color: 0xffffff,
    //   specular: 0xffffff,
    //   map: sp
    // })
    const cube = new THREE.Mesh(this.geometry, this.material)
    if (x !== undefined && y !== undefined && z !== undefined) {
      cube.position.set(x, y, z)
    }
    this.scene.add(cube)
    return cube
  }
}
