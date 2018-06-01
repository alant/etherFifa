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
  CardText
} from 'reactstrap';

class GameBoard extends Component {
  constructor() {
    super();
    this.state = {
      web3: null,
      // fifaContract: null,
      games: [],
      fetchInProgress: true,
      gameCount: 0
    }

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

    // this.setState({ fifaContract: fifaWorldCup })
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
            contractInstance.getName(i, { from: accounts[0] }),
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
                name: _game[0],
                startTime: _game[1],
                win: _game[2],
                draw: _game[3],
                lose: _game[4]
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
    console.log("div num: " + i + " was clicked")
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
                <CardTitle>{game.name}</CardTitle>
                <CardSubtitle>Start time: {timeConverter(game.startTime)}</CardSubtitle>
                <CardText>
                  Win: {JSON.stringify(game.win)}
                  Draw: {JSON.stringify(game.draw)}
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
            </Container>
        }
      </div>
    )
  }
}

export default GameBoard