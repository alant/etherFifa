import React, { Component } from 'react';
import { Alert } from "reactstrap";
import GameBoard from "./GameBoard";

class Home extends Component {
  componentWillMount() {
    // console.log("= home prop extension avail:" + this.props.extensionAvail);
  }
  render() {
    return (
      <div>
        <Alert color="info">
          Alpha testing phase on Ropsten testnet. Make sure you choose Ropsten network in your Metamask extension. This is a FIFA 2018 prediction market, win Ether from the other sides when your prediction is correct. Winning is propotionally distributed. There is a 1% fee when withdrawing your prediction winning. If you need Ropsten Ether to test this DApp, leave a message in Discord.
        </Alert>
        <img alt="extension screenshot" src={require('./imgs/metamask_ropsten.jpg')} />
        {
          !this.props.extensionAvail && (
            <Alert color="warning">
              You need metamask to play this game.
              </Alert>
          )
        }
        {
          this.props.extensionAvail && (
            <GameBoard fetchInProgress={this.props.fetchInProgress} games={this.props.games} />
          )
        }
      </div>
    )
  }
}

export default Home