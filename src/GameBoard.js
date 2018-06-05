import React, { Component } from 'react';
import {
  Container
} from 'reactstrap'
import GameCards from './GameCards'

class GameBoard extends Component {
  constructor() {
    super();
    this.state = {
      fetchInProgress: true,
      gameCount: 0,
      modal: false,
      adminModal: false,
      gameSelected: 0,
      directionSelected: 1,
      inputVoteSize: 0.01,
      profit: 0
    }
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState({
      modal: !this.state.modal
    })
  }
  adminToggle = (dataFromGameCards) => {
    this.setState({
      adminModal: !this.state.adminModal,
      gameSelected: dataFromGameCards
    })
  }

  handleClick(i, event) {
    this.setState({ gameSelected: i })
    this.toggle()
  }
 
  render() {
    console.log("= games prop: " + JSON.stringify(this.props.games))
    return (
      <div>
        {
          this.props.fetchInProgress ?
            <p> Loading from Etherum blockchain network... </p>
            :
            <Container>
              <GameCards games={this.props.games} mode={this.props.mode} handler={this.adminToggle} />
            </Container>
        }
      </div>
    )
  }
}

export default GameBoard