import React, { Component } from 'react';
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'
import {
  Table,
  Button,
  Alert
} from 'reactstrap';
class MyVote extends Component {
  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      winnings: null,
      deposits: null,
      gameCount: 0,
      fetchInProgress: true,
      fifaContract: null,
      metaMaskUnlocked: true,
      games: null
    }
  }
  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract()
    }).catch(() => {
      console.log('Error finding web3.')
    })
  }
  instantiateContract() {
    const contract = require('truffle-contract')
    const fifaWorldCup = contract(FifaWorldCupContract)
    fifaWorldCup.setProvider(this.state.web3.currentProvider)
    this.setState({ fifaContract: fifaWorldCup })

    let contractInstance
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup.deployed().then((_instance) => {
        contractInstance = _instance;
        if (accounts[0]) {
          return _instance.getGameCount({ from: accounts[0] })
        } else {
          this.setState({ metaMaskUnlocked: false })
        }
      }).then((result) => {
        // console.log("= GameBoard: getGameCount: " + result);
        this.setState({ gameCount: result })

        var promises = []
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
            var _games = []
            result.forEach((_game) => {
              // console.log("== game: " + _game)
              var game = {
                teamA: _game[0],
                teamB: _game[1],
                startTime: _game[2],
                win: this.state.web3.fromWei(_game[3], 'ether'),
                draw: this.state.web3.fromWei(_game[4], 'ether'),
                lose: this.state.web3.fromWei(_game[5], 'ether')
              }
              _games.push(game)
            })
            this.setState({ games: _games })
          })
        })

        var promises1 = []
        var promises2 = []
        // console.log("= myVote gamecount: " + result)
        // console.log("= myVote account0: " + accounts[0])
        for (let i = 0; i < result; i++) {
          promises1.push(contractInstance.getWinning(i, accounts[0], { from: accounts[0] }))
          promises2.push(contractInstance.getDeposit(i, accounts[0], { from: accounts[0] }))
        }
        Promise.all(promises1).then((result) => {
          console.log("!= getWinning: " + JSON.stringify(result))
          var valInEther = result.map(valInWei => this.state.web3.fromWei(valInWei, "ether"))
          this.setState({
            winnings: valInEther
          })
        })
        Promise.all(promises2).then((result) => {
          console.log("!= getdeposit: " + JSON.stringify(result))
          var valInEther = result.map(valInWei => this.state.web3.fromWei(valInWei, "ether"))
          this.setState({
            deposits: valInEther,
            fetchInProgress: false
          })
        })
      })
    })

  }
  withdraw(gameId) {
    console.log("withdraw from game: " + gameId)
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.fifaContract.deployed().then((_instance) => {
        return _instance.withdraw(gameId, { from: accounts[0] })
      }).then((result) => {
        console.log("= withdraw: " + JSON.stringify(result))
      })
    })
  }
  render() {
    const tableRows = () => {
      var rows = []
      // console.log("= data: " + this.state.deposits)
      if (!this.state.deposits || !this.state.games || !this.state.winnings) {
        return
      }
      for (let i = 0; i < this.state.gameCount; i++) {
        rows.push(
          parseFloat(this.state.deposits[i]) ?
            <tr key={i}>
              <th scope="row">{this.state.games[i].teamA} VS {this.state.games[i].teamB}</th>
              <td>{parseFloat(this.state.deposits[i])}</td>
              <td>{parseFloat(this.state.winnings[i])}</td>
              <td>
                {
                  (() => {
                    if (parseFloat(this.state.winnings[i]) > 0) {
                      return (
                        < Button color="primary" onClick={this.withdraw.bind(this, i)}>
                          Withdraw
                        </Button>
                      )
                    } else {
                      return (
                        <span />
                      )
                    }
                  })()
                }
              </td>
            </tr >
            :
            <tr key={i} />
        )
      }
      return rows
    }
    return (
      <div>
        {
          this.state.metaMaskUnlocked ?
            <div>
              {this.state.fetchInProgress && <p> Loading from Etherum blockchain network... </p>}
              <Table>
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Deposit</th>
                    <th>Proceed</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows()}
                </tbody>
              </Table>
            </div>
            :
            <div className="text-center">
              <Alert>
                To see your previous votes, login metamask first. Click the metamask extension icon, then login with your passwword.
              </Alert>
              <img alt="extension screenshot" src={require('./imgs/metamask.jpg')} />
            </div>
        }
      </div >
    )
  }
}

export default MyVote