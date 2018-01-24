import * as THREE from 'three'

const screenWidth = window.innerWidth * window.devicePixelRatio
const screenHeight = window.innerHeight * window.devicePixelRatio

let gameBoardCanvas = document.createElement('canvas')
let gameBoardCtx = gameBoardCanvas.getContext('2d')

export default class GameInfo {
  constructor () {
    // console.log(ctx)
    this.context = gameBoardCtx
    this.cameraHUD = new THREE.OrthographicCamera(-screenWidth / 2, screenWidth / 2, screenHeight / 2, -screenHeight / 2, 0, 1)
    this.sceneHUD = new THREE.Scene()
    gameBoardCanvas.width = screenWidth
    gameBoardCanvas.height = screenHeight
  }
  // Create also a custom scene for HUD.

  init () {
    // return new Promise((ersolve,reject) => {
    // Create texture from rendered graphics.
    // const canvasURI = gameBoardCanvas.toDataURL()
    // const textures = new THREE.Texture(gameBoardCanvas)
    // textures.needsUpdate = true
    const hudTexture = new THREE.Texture(gameBoardCanvas)
    hudTexture.needsUpdate = true
    // Create HUD material.
    const material = new THREE.MeshBasicMaterial({ map: hudTexture })
    material.transparent = true
    // const sprite = new THREE.Sprite(material)
    // const width = material.map.image.width;
    // const height = material.map.image.height;
    // sprite.scale.set( width, height, 1 );
    // material.transparent = true;
    // console.log(sprite)
    const planeGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight)
    const plane = new THREE.Mesh(planeGeometry, material)
    plane.position.set(0, 0, 0)
    console.log(plane)
    this.sceneHUD.add(plane)

    // this.sceneHUD.add(sprite)
    // resolve(mesh)
    // })
    // Create plane to render the HUD. This plane fill the whole screen.
    // const planeGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
    // const plane = new THREE.Mesh(planeGeometry, material);
    // sceneHUD.add(plane)
  }
  renderGameOver (score = 0) {
    // ctx.drawImage(atlas, 0, 0, 119, 108, screenWidth / 2 - 150, screenHeight / 2 - 100, 300, 300)
    this.context.font = 'Bold 90px Arial'
    this.context.textAlign = 'center'
    this.context.fillStyle = 'rgba(245,245,245,0.75)'
    this.context.fillText(
      '游戏结束',
      screenWidth / 2,
      // screenWidth / 2 - 40,
      screenHeight / 2 - 100 + 50 * window.devicePixelRatio
    )

    this.context.fillText(
      '得分: ' + score,
      screenWidth / 2,
      screenHeight / 2 - 100 + 130 * window.devicePixelRatio
    )

    // ctx.drawImage(
    //   atlas,
    //   120, 6, 39, 24,
    //   screenWidth / 2 - 60,
    //   screenHeight / 2 - 100 + 180,
    //   120, 40
    // )

    this.context.fillText(
      '重新开始',
      screenWidth / 2,
      screenHeight / 2 - 100 + 205 * window.devicePixelRatio
    )
    /**
     * 重新开始按钮区域
     * 方便简易判断按钮点击
     */
    // this.btnArea = {
    //   startX: screenWidth / 2 - 40,
    //   startY: screenHeight / 2 - 100 + 180,
    //   endX: screenWidth / 2 + 50,
    //   endY: screenHeight / 2 - 100 + 255
    // }
    this.init()
  }
}
