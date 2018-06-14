import React, { Component } from 'react';
import {
  Container
} from 'reactstrap'
import GameCards from './GameCards'

class GameBoard extends Component {
  render() {
    // console.log("= games prop: " + JSON.stringify(this.props.games))
    return (
      <div>
        {
          this.props.fetchInProgress ?
            <p> Loading from Etherum blockchain network... </p>
            :
            <Container>
              <GameCards games={this.props.games} mode={this.props.mode} gameCount={this.props.gameCount}/>
            </Container>
        }
      </div>
    )
  }
}

export default GameBoard