import React, { Component } from 'react';
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'
import {
  Row,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Col,
  Alert
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

class GameCards extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gameSelected: 0,
      modal: false,
      adminModal: false,
      web3: null,
      fifaContract: null,
      gameResult: 1,
      inputVoteSize: 0.1,
      directionSelected: 0,
      profit: 0,
      formWarning: false,
      gameTime: 0
    }
    this.adminToggle = this.adminToggle.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleGameTimeChange = this.handleGameTimeChange.bind(this);
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

  }
  handleClick(i, event) {
    this.setState({ gameSelected: i })
    this.toggle()
  }
  adminHandler(i, event) {
    this.setState({ gameSelected: i })
    this.getGameTime()
    this.adminToggle()
  }
  getGameTime() {
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract.deployed().then((_instance) => {
        return _instance.getStartTime(this.state.gameSelected, { from: accounts[0] })
      }).then((result) => {
        console.log("= start time return: " + JSON.stringify(result))
        this.setState({ gameTime: parseInt(result, 10) })
      })
    })
  }
  adminToggle() {
    this.setState({
      adminModal: !this.state.adminModal,
      gameResult: 1
    })
  }
  toggle() {
    this.setState({
      modal: !this.state.modal,
      inputVoteSize: 0.1,
      directionSelected: 0,
      profit: 0,
      formWarning: false
    }, this.calculateProfit())
  }
  toggleWarning() {
    this.setState({ formWarning: true })
  }
  changeVoteSize(event) {
    this.setState({ inputVoteSize: event.target.value }, this.calculateProfit.bind(this))
  }
  changeVoteDirection(event) {
    this.setState({ formWarning: false })
    this.setState({ directionSelected: event.target.value }, this.calculateProfit.bind(this))
  }
  calculateProfit() {
    console.log("= calculating profit: direction:" + this.state.directionSelected + " game: " + this.state.gameSelected + " vote size: " + this.state.inputVoteSize)
    var _profit = 0.0
    var _totalWin = 0.0
    var _direction = parseInt(this.state.directionSelected, 10)
    switch (_direction) {
      case 1:
        _totalWin = parseFloat(this.props.games[this.state.gameSelected].draw) + parseFloat(this.props.games[this.state.gameSelected].lose)
        _profit = _totalWin * parseFloat(this.state.inputVoteSize) / (parseFloat(this.state.inputVoteSize) + parseFloat(this.props.games[this.state.gameSelected].win))
        break
      case 2:
        _totalWin = parseFloat(this.props.games[this.state.gameSelected].win) + parseFloat(this.props.games[this.state.gameSelected].lose)
        _profit = _totalWin * parseFloat(this.state.inputVoteSize) / (parseFloat(this.state.inputVoteSize) + parseFloat(this.props.games[this.state.gameSelected].draw))
        break
      case 3:
        _totalWin = parseFloat(this.props.games[this.state.gameSelected].win) + parseFloat(this.props.games[this.state.gameSelected].draw)
        _profit = _totalWin * parseFloat(this.state.inputVoteSize) / (parseFloat(this.state.inputVoteSize) + parseFloat(this.props.games[this.state.gameSelected].lose))
        break
      default:
        _profit = 0
    }
    console.log("= profit: " + _profit)
    this.setState({ profit: _profit })
  }
  vote() {
    if (this.state.directionSelected === 0) {
      this.toggleWarning()
    } else {
      const contract = require('truffle-contract')
      const fifaWorldCup = contract(FifaWorldCupContract)
      fifaWorldCup.setProvider(this.state.web3.currentProvider)

      var contractInstance
      var defaultAccount
      this.state.web3.eth.getAccounts((error, accounts) => {
        fifaWorldCup.deployed().then((_instance) => {
          contractInstance = _instance;
          defaultAccount = accounts[0]
          return _instance.canVote(0, { from: defaultAccount })
        }).then((result) => {
          if (result === true) {
            console.log("=== call castVote ===")
            return contractInstance.castVote(this.state.gameSelected, this.state.directionSelected, { from: defaultAccount, value: this.state.web3.toWei(this.state.inputVoteSize, "ether") })
          } else {
            console.log("vote: canVote?: " + result + " type: " + typeof (result))
          }
        }).then((result) => {
          console.log("castVote result: " + JSON.stringify(result))
        })
      })
    }
  }
  setGameResult(event) {
    this.setState({ gameResult: event.target.value })
  }
  gameOver() {
    console.log("= game " + this.state.gameSelected + " over = result: " + this.state.gameResult)
    const contract = require('truffle-contract')
    const fifaWorldCup = contract(FifaWorldCupContract)
    fifaWorldCup.setProvider(this.state.web3.currentProvider)
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup.deployed().then((_instance) => {
        return _instance.setResult(this.state.gameSelected, this.state.gameResult, { from: accounts[0] })
      }).then((result) => {
        console.log("= setResult return: " + JSON.stringify(result))
      })
    })
  }
  handleGameTimeChange(_date) {
    _date = Math.floor(_date / 1000)
    this.setState({ gameTime: _date })
    console.log("handleGameTimeChagne: " + _date)
  }
  newGameTime() {
    console.log("= game " + this.state.gameSelected + " new Time: " + this.state.gameTime)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract.deployed().then((_instance) => {
        return _instance.setStartTime(this.state.gameSelected, this.state.gameTime, { from: accounts[0] })
      }).then((result) => {
        console.log("=! set new start time return: " + JSON.stringify(result))
      })
    })
  }
  render() {
    function timeConverter(UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
      return time;
    }
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
      <div>
        {this.props.games.map((game, i) => {
          return (
            <div key={i}>
              <Row className="justify-content-md-center">
                <Card className="gameCard" onClick={
                  this.props.mode === "admin" ?
                    this.adminHandler.bind(this, i)
                    :
                    this.handleClick.bind(this, i)
                }>
                  <CardBody>
                    <CardTitle>{game.teamA} VS {game.teamB}</CardTitle>
                    <CardSubtitle>Start time: {timeConverter(game.startTime)}</CardSubtitle>
                    <CardText>
                      1: {JSON.stringify(game.win)} {" "}
                      X: {JSON.stringify(game.draw)} {" "}
                      2: {JSON.stringify(game.lose)}
                    </CardText>
                  </CardBody>

                </Card>
              </Row>
            </div>
          )
        })}
        {this.props.games[0] && (
          this.props.mode === "admin" ?
            //admin modal
            <Modal isOpen={this.state.adminModal} toggle={this.adminToggle} className={this.props.className}>
              <ModalHeader toggle={this.adminToggle}>{this.props.games[this.state.gameSelected].teamA} VS {this.props.games[this.state.gameSelected].teamB}</ModalHeader>
              <ModalBody>
                <FormGroup>
                  <Label for="winnerSelect">Who Won?</Label>
                  <Input type="select" name="select" id="winnerSelect" onChange={this.setGameResult.bind(this)}>
                    <option value={1}>{this.props.games[this.state.gameSelected].teamA}</option>
                    <option value={2}> Draw </option>
                    <option value={3}>{this.props.games[this.state.gameSelected].teamB}</option>
                  </Input>
                </FormGroup>
                <Button color="danger" onClick={this.gameOver.bind(this)}>Set!</Button>{' '}
                <FormGroup>
                  <Label>New game time:</Label>
                  <FixDatePickerTimer>
                    <DatePicker
                      selected={moment.unix(this.state.gameTime)}
                      onChange={this.handleGameTimeChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={30}
                      dateFormat="LLL"
                      timeCaption="time"
                    />
                  </FixDatePickerTimer>
                  <Button color="danger" onClick={this.newGameTime.bind(this)}>Set!</Button>{' '}
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={this.adminToggle}>Cancel</Button>
              </ModalFooter>
            </Modal>
            :
            //regular user modal
            <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
              <ModalHeader toggle={this.toggle}>{this.props.games[this.state.gameSelected].teamA} VS {this.props.games[this.state.gameSelected].teamB}</ModalHeader>
              <ModalBody>
                <FormGroup tag="fieldset" onChange={this.changeVoteDirection.bind(this)}>
                  <legend>Predict winning team is:</legend>
                  {this.state.formWarning && (<Alert color="warning"> pick a team below </Alert>)}
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" value={1} name="direction" />{' '}
                      {this.props.games[this.state.gameSelected].teamA}
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" value={2} name="direction" />{' '}
                      Draw
                      </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" value={3} name="direction" />{' '}
                      {this.props.games[this.state.gameSelected].teamB}
                    </Label>
                  </FormGroup>
                </FormGroup>
                <FormGroup>
                  <Label for="exampleNumber">Vote size in Eth:</Label>
                  <Row>
                    <Col xs="3">
                      <Input type="number" onChange={this.changeVoteSize.bind(this)} value={this.state.inputVoteSize} placeholder={this.state.inputVoteSize} />
                    </Col>
                    <Col xs="auto">
                      <Button onClick={this.changeVoteSize.bind(this)} value="0.001" color="info">0.001</Button>{' '}
                      <Button onClick={this.changeVoteSize.bind(this)} value="0.01" color="info">0.01</Button>{' '}
                      <Button onClick={this.changeVoteSize.bind(this)} value="0.1" color="info">0.1</Button>{' '}
                      <Button onClick={this.changeVoteSize.bind(this)} value="1" color="info">1</Button>{' '}
                    </Col>
                  </Row>
                </FormGroup>
                For a profit of: {this.state.profit}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={this.vote.bind(this)}>Vote</Button>{' '}
                <Button color="secondary" onClick={this.toggle}>Cancel</Button>
              </ModalFooter>
            </Modal>
        )}
      </div>
    )
  }
}

export default GameCards