import React, { Component } from 'react';
import { Alert } from "reactstrap";
import GameBoard from "./GameBoard";

class Home extends Component {
  componentWillMount() {
    console.log("= home prop extension avail:" + this.props.extensionAvail);
  }
  render() {
    return (
      <div>
        {
          !this.props.extensionAvail && (
            <Alert color="warning">
              You need metamask to play this game.
              </Alert>
          )}
        <GameBoard fetchInProgress={this.props.fetchInProgress} games={this.props.games} />
      </div>
    )
  }
}

export default Home