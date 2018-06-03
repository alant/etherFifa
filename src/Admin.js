import React, { Component } from 'react';
import {
  Button
} from 'reactstrap';
import NewGame from "./NewGame.js"

class Admin extends Component {
  constructor() {
    super()
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
      </div>
    )
  }
}

export default Admin