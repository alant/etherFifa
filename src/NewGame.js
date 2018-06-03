import React, { Component } from 'react';
import {
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'
import styled from 'styled-components';

import 'react-datepicker/dist/react-datepicker.css';

class NewGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamA: "",
      teamB: "",
      startDate: moment(),
      web3: null,
      fifaContract: null,
      timeStamp: 0,
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
  teamAHandler(event) {
    this.setState({ teamA: event.target.value });
  }
  teamBHandler(event) {
    this.setState({ teamB: event.target.value });
  }

  newGameHandler() {
    // console.log("=state: " + JSON.stringify(this.state));
    // console.log("=contract addr: " + this.props.contractAddr);
    var contractInstance;
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract.deployed().then((_instance) => {
        contractInstance = _instance
        return _instance.addGame(this.state.teamA, this.state.teamB, this.state.timeStamp, { from: accounts[0] })
      }).then(function () {
        return contractInstance.getGameCount({ from: accounts[0] })
      }).then(function (returnValue) {
        console.log("== game count: " + returnValue);
      })
    })
  }
  render() {
    const FixDatePickerTimer = styled.span`
      & .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
        padding-left: unset;
        padding-right: unset;
        width: 100px;
      }
      & .react-datepicker__input-container {
        width:100%;
      }
      & .react-datepicker-wrapper {
        width:100%;
      }
      & .react-datepicker {
        width: 314px;
      }
    `;

    return (
      <div className='new-game'>
        <Modal isOpen={this.props.open} toggle={this.props.toggle} className={this.props.className}>
          <ModalHeader toggle={this.props.toggle}>New Game</ModalHeader>
          <ModalBody>
            <Label> Teams: </Label>
            <Input value={this.state.teamA}
              onChange={this.teamAHandler.bind(this)}
              type="text" className="gameNameInput" />
            {" "} VS {" "}
            <Input value={this.state.teamB}
              onChange={this.teamBHandler.bind(this)}
              type="text" className="gameNameInput" />
            <Label> Game start local time</Label>
            <FixDatePickerTimer>
              <DatePicker
                selected={this.state.startDate}
                onChange={this.handleChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="LLL"
                timeCaption="time"
              />
            </FixDatePickerTimer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={this.newGameHandler.bind(this)}> Submit</Button>{' '}
            <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}

export default NewGame