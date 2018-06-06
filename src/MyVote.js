import React, { Component } from 'react';
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'
import {
  Table,
  Button
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
      fifaContract: null
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
        contractInstance = _instance
        return _instance.getGameCount({ from: accounts[0] })
      }).then((result) => {
        var promises1 = []
        var promises2 = []
        this.setState({ gameCount: result });
        console.log("gamecount: " + result)
        for (let i = 0; i < result; i++) {
          promises1.push(contractInstance.getWinning(i, accounts[0], { from: accounts[0] }))
          promises2.push(contractInstance.getDeposit(i, accounts[0], { from: accounts[0] }))
        }
        Promise.all(promises1).then((result) => {
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
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup.deployed().then((_instance) => {

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
      console.log("= data: " + this.state.deposits)
      for (let i = 0; i < this.state.gameCount; i++) {
        rows.push(
          parseFloat(this.state.deposits[i]) ?
            <tr key={i}>
              <th scope="row">{this.props.games[i].teamA} VS {this.props.games[i].teamB}</th>
              <td>{parseFloat(this.state.deposits[i])}</td>
              <td>{parseFloat(this.state.winnings[i])}</td>
              <td>
                {
                  (() => {
                    if (parseFloat(this.state.winnings[i]) > 0) {
                      return (
                        < Button disabled color="primary" onClick={this.withdraw.bind(this, i)}>
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
                  this.state.fetchInProgress ?
                    <p> Loading from Etherum blockchain network... </p>
                    :
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
                }
              </div >
              )
                }
              }
              
export default MyVote