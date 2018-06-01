import React, { Component } from 'react';
import {
  Label,
  Input,
  Button
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'

import 'react-datepicker/dist/react-datepicker.css';

class NewGame extends Component {
  constructor() {
    super();
    this.state = {
      gameName: "",
      startDate: moment(),
      web3: null,
      fifaContract: null,
      timeStamp: 0
    }
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const fifaWorldCup = contract(FifaWorldCupContract)
    fifaWorldCup.setProvider(this.state.web3.currentProvider)
    this.setState({ fifaContract: fifaWorldCup })
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract.deployed().then((_instance) => {
        return _instance.getGameCount({ from: accounts[0] })
      }).then((result) => {
        console.log("= newGame: getGameCount: " + result);
      })
    })
  }

  handleChange(date) {
    this.setState({
      startDate: date
    })
    var _timeStamp = Math.floor(date / 1000)
    this.setState({
      timeStamp: _timeStamp
    })
    console.log("= date in UTC: " + this.state.timeStamp)
  }
  gameNameHandler(event) {
    this.setState({ gameName: event.target.value });
  }

  newGameHandler() {
    // console.log("=state: " + JSON.stringify(this.state));
    // console.log("=contract addr: " + this.props.contractAddr);
    var contractInstance;
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract.deployed().then((_instance) => {
        contractInstance = _instance
        return _instance.addGame(this.state.gameName, this.state.timeStamp, { from: accounts[0] })
      }).then(function () {
        return contractInstance.getGameCount({ from: accounts[0] })
      }).then(function (returnValue) {
        console.log("== game count: " + returnValue);
      })
    })
  }
  render() {
    return (
      <div className='new-game'>
        <Label> Game title </Label>
        <Input value={this.state.gameName}
          onChange={this.gameNameHandler.bind(this)}
          type="text" className="gameNameInput" />
        <Label> Game start local time</Label>
        <DatePicker
          selected={this.state.startDate}
          onChange={this.handleChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={60}
          dateFormat="LLL"
          timeCaption="time"
        />
        <Button onClick={this.newGameHandler.bind(this)}> Submit</Button>
      </div>
    );
  }
}

export default NewGame