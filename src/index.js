import Jumper from 'src/jumper/index'

const jumper = new Jumper()
jumper.directLight.position.set(3, 10, 5)
// jumper.setLightPosition(50, -50, 50)
jumper.addCube()
jumper.addCube()
jumper.addPlayer()
jumper.setCameraPositon(-100, 100, 100)
jumper.addScene()
jumper.renderStatic()
// jumper.render()