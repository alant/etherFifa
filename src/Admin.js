import React, { Component } from 'react';
import {
  Button
} from 'reactstrap';
import NewGame from './NewGame'
import GameBoard from './GameBoard'

class Admin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false
    }
  }
  toggle() {
    this.setState({showModal: !this.state.showModal})
  }
  render() {
    return (
      <div>
        <Button color="danger" onClick={this.toggle.bind(this)}>New Game</Button>
        <NewGame open={this.state.showModal} toggle={this.toggle.bind(this)} />
        <GameBoard fetchInProgress={this.props.fetchInProgress} games={this.props.games} mode="admin" />
      </div>
    )
  }
}

export default Admin