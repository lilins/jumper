import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Jumper from 'src/jumper/index'
import 'src/index.css'

const Info = {
  name: 'Jumper',
  author: 'lilins@qq.com',
  scoreText: 'score:',
  finalScore: 'Final Score',
  restart: 'RESTART'
}
class Container extends Component {
  constructor(props){
    super(props)
    this.state = {
      score: 0,
      failTableVisible: false
    }
    this.jumper = new Jumper()
  }
  addScore = () => {
    const { score } = this.state
    this.setState({ score: score + 1 })
  }
  failCallBack = () => {
    this.setState({ failTableVisible: true })
  }
  restart = () => {
    this.setState({ score: 0, failTableVisible: false })
    this.jumper.restart()
  }
  componentDidMount(){
    this.jumper.init()
    this.jumper.setSucessFunction(this.addScore)
    this.jumper.setFailFunction(this.failCallBack)
    this.container.appendChild(this.jumper.renderer.domElement)
    document.body.addEventListener('mousedown', this.jumper.handleDown)
    document.body.addEventListener('mouseup', this.jumper.handleUp)
  }
  componentWillUnMount () {
    document.body.removeEventListener('mousedown', this.jumper.handleDown)
    document.body.removeEventListener('mouseup', this.jumper.handleUp)
  }
  render () {
    const { name, author, scoreText, finalScore, restart } = Info
    const { score, failTableVisible } = this.state
    return <div className="container" ref={ ref => this.container = ref }>
        <div className="score-board">
          <h1>{name}</h1>
          <h3 className="score"><email>{author}</email></h3>
          <h1 className="score">{scoreText + score}</h1>
        </div>
        { failTableVisible
          ? <div className="fail-table">
                <h1>{finalScore}</h1>
                <h3 className="final-score">{score}</h3>
                <a onClick={this.restart} className="fail-restart">{restart}</a>
            </div>
          : null 
        }
        <div>
        </div>
      </div>
  }
}

ReactDOM.render(
  <Container />,
  document.getElementById('root')
)