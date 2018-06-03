import React, { Component } from 'react';
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'
import {
  Container,
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
  Col
} from 'reactstrap';

class GameBoard extends Component {
  constructor() {
    super();
    this.state = {
      web3: null,
      fifaContract: null,
      games: [],
      fetchInProgress: true,
      gameCount: 0,
      modal: false,
      gameSelected: 0,
      directionSelected: 1,
      inputVoteSize: 0.01,
      profit: 0
    }
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  componentDidMount() {
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

    var contractInstance
    var promises = []

    this.setState({ fifaContract: fifaWorldCup })
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup.deployed().then((_instance) => {
        contractInstance = _instance;
        return _instance.getGameCount({ from: accounts[0] })
      }).then((result) => {
        // console.log("= GameBoard: getGameCount: " + result);
        this.setState({ gameCount: result })
        for (let i = 0; i < result; i++) {
          var innerRequests = [
            contractInstance.getTeamA(i, { from: accounts[0] }),
            contractInstance.getTeamB(i, { from: accounts[0] }),
            contractInstance.getStartTime(i, { from: accounts[0] }),
            contractInstance.getWinVote(i, { from: accounts[0] }),
            contractInstance.getDrawVote(i, { from: accounts[0] }),
            contractInstance.getLoseVote(i, { from: accounts[0] })
          ]
          promises.push(Promise.all(innerRequests))
        }
        Promise.all(promises).then((innerPromise) => {
          Promise.all(innerPromise).then((result) => {
            // console.log(result)
            result.forEach((_game) => {
              console.log("== game: " + _game)
              var game = {
                teamA: _game[0],
                teamB: _game[1],
                startTime: _game[2],
                win: this.state.web3.fromWei(_game[3], 'ether'),
                draw: this.state.web3.fromWei(_game[4], 'ether'),
                lose: this.state.web3.fromWei(_game[5], 'ether')
              }
              this.state.games.push(game)
            })
            this.setState({ fetchInProgress: false })
          })
        })
      })
    })
  }
  handleClick(i, event) {
    this.setState({ gameSelected: i })
    this.toggle()
  }
  changeVoteSize(event) {
    this.setState({ inputVoteSize: event.target.value }, this.calculateProfit.bind(this))
  }
  changeVoteDirection(event) {
    this.setState({ directionSelected: event.target.value }, this.calculateProfit.bind(this))
  }
  calculateProfit() {
    var _profit = 0.0
    var _totalWin = 0.0
    var _direction = parseInt(this.state.directionSelected, 10)
    switch (_direction) {
      case 1:
        _totalWin = parseFloat(this.state.games[this.state.gameSelected].draw) + parseFloat(this.state.games[this.state.gameSelected].lose)
        _profit = _totalWin * parseFloat(this.state.inputVoteSize) / (parseFloat(this.state.inputVoteSize) + parseFloat(this.state.games[this.state.gameSelected].win))
        break
      case 2:
        _totalWin = parseFloat(this.state.games[this.state.gameSelected].win) + parseFloat(this.state.games[this.state.gameSelected].lose)
        _profit = _totalWin * parseFloat(this.state.inputVoteSize) / (parseFloat(this.state.inputVoteSize) + parseFloat(this.state.games[this.state.gameSelected].draw))
        break
      case 3:
        _totalWin = parseFloat(this.state.games[this.state.gameSelected].win) + parseFloat(this.state.games[this.state.gameSelected].draw)
        _profit = _totalWin * parseFloat(this.state.inputVoteSize) / (parseFloat(this.state.inputVoteSize) + parseFloat(this.state.games[this.state.gameSelected].lose))
        break
      default:
        _profit = 0
    }
    this.setState({profit: _profit})
  }
  vote() {
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
    console.log("= games state: " + JSON.stringify(this.state.games))

    const GameCards = this.state.games.map((game, i) => {
      return (
        <div key={i}>
          <Row className="justify-content-md-center">
            <Card className="gameCard" onClick={this.handleClick.bind(this, i)}>
              <CardBody>
                <CardTitle>{game.teamA} VS {game.teamB}</CardTitle>
                <CardSubtitle>Start time: {timeConverter(game.startTime)}</CardSubtitle>
                <CardText>
                  Win: {JSON.stringify(game.win)} {" "}
                  Draw: {JSON.stringify(game.draw)} {" "}
                  Lose: {JSON.stringify(game.lose)}
                </CardText>
              </CardBody>

            </Card>
          </Row>
        </div>
      )
    })
    return (
      <div>
        {
          this.state.fetchInProgress ?
            <p> Loading from Etherum blockchain network... </p>
            :
            <Container>
              {GameCards}

              <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>{this.state.games[this.state.gameSelected].teamA} VS {this.state.games[this.state.gameSelected].teamB}</ModalHeader>
                <ModalBody>
                  <FormGroup tag="fieldset" onChange={this.changeVoteDirection.bind(this)}>
                    <legend>Voting for:</legend>
                    <FormGroup check>
                      <Label check>
                        <Input type="radio" value={1} name="direction" defaultChecked="checked" />{' '}
                        Win
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
                        Lose
                      </Label>
                    </FormGroup>
                  </FormGroup>
                  <FormGroup>
                    <Label for="exampleNumber">Vote size:</Label>
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
            </Container>
        }
      </div>
    )
  }
}

export default GameBoard