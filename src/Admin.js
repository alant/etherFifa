import React, { Component } from "react";
import { Button, Input } from "reactstrap";
import NewGame from "./NewGame";
import GameBoard from "./GameBoard";
import getWeb3 from './utils/getWeb3'
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      amount: 0,
      web3: null,
      fifaContract: null
    };
  }

  toggle() {
    this.setState({ showModal: !this.state.showModal });
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log("Error finding web3.");
      });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require("truffle-contract");
    const fifaWorldCup = contract(FifaWorldCupContract);
    fifaWorldCup.setProvider(this.state.web3.currentProvider);
    this.setState({ fifaContract: fifaWorldCup });
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract
        .deployed()
        .then(_instance => {
          return _instance.getGameCount({ from: accounts[0] });
        })
        .then(result => {
          console.log("== Admin : getGameCount: " + result);
        });
    });
  }

  getPaid() {
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract
        .deployed()
        .then(_instance => {
          console.log("== withdrawing: " + this.state.web3.toWei(this.state.amount, 'ether'))
          return _instance.getPaid(this.state.web3.toWei(this.state.amount, 'ether'), { from: accounts[0] });
        })
        .then(function(returnValue) {
          console.log("== getPaid return: " + JSON.stringify(returnValue));
        });
    });
  }
  getPaidInputHandler(event) {
    this.setState({ amount: event.target.value });
    // console.log("= admin: amount is: " + event.target.value);
  }
  render() {
    return (
      <div>
        <Button color="danger" onClick={this.toggle.bind(this)}>
          New Game
        </Button>
        <NewGame open={this.state.showModal} toggle={this.toggle.bind(this)} />
        <Input
          placeholder="Amount"
          type="number"
          onChange={this.getPaidInputHandler.bind(this)}
        />
        <Button color="danger" onClick={this.getPaid.bind(this)}>
          Get Paid
        </Button>
        <GameBoard
          fetchInProgress={this.props.fetchInProgress}
          games={this.props.games}
          mode="admin"
        />
      </div>
    );
  }
}

export default Admin;
