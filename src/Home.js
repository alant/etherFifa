import React, { Component } from 'react';
import { Alert } from "reactstrap";
import GameBoard from "./GameBoard";
import { FormattedMessage } from "react-intl";

class Home extends Component {
  componentWillMount() {
    // console.log("= home prop extension avail:" + this.props.extensionAvail);
  }
  render() {
    return (
      <div>
        <Alert color="info">
          <FormattedMessage
            id="app.intro"
            defaultMessage="This is a FIFA 2018 prediction market, win Ether from others when your prediction is correct. Winning is propotionally distributed. There is a 1% fee when withdrawing your prediction winning. Leave a message in Discord if you have any questions or feedback."
            description="intro of prediction market"
          />
        </Alert>
        {
          !this.props.extensionAvail && (
            <Alert color="warning">
              You need metamask to play this game.
              </Alert>
          )
        }
        {
          this.props.extensionAvail && (
            <GameBoard fetchInProgress={this.props.fetchInProgress} games={this.props.games} gameCount={this.props.gameCount}/>
          )
        }
      </div>
    )
  }
}

export default Home