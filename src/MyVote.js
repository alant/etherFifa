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
      gameCount: 0,
      fetchInProgress: true
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
    var promises = []
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup.deployed().then((_instance) => {
        contractInstance = _instance
        return _instance.getGameCount({ from: accounts[0] })
      }).then((result) => {
        this.setState({ gameCount: result });
        for (let i = 0; i < result; i++) {
          promises.push(contractInstance.getWinning(i, accounts[0], { from: accounts[0] }))
        }
        Promise.all(promises).then((result) => {
          var valInEther = result.map(valInWei => this.state.web3.fromWei(valInWei, "ether"))
          this.setState({
            winnings: valInEther,
            fetchInProgress: false
          })
        })
      })
    })
  }
  render() {
    return (
      <div>
        {
          this.state.fetchInProgress ?
            <p> Loading from Etherum blockchain network... </p>
            :
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Proceed</th>
                </tr>
              </thead>
              <tbody>
                {this.state.winnings.map((proceed, i) => {
                  return (
                    parseFloat(proceed) ?
                      <tr key={i}>
                        <th scope="row">{i}</th>
                        <td>{parseFloat(proceed)}</td>
                        <td><Button color="primary">Withdraw</Button></td>
                      </tr>
                      :
                      <tr key={i}/>
                  )
                })}
              </tbody>
            </Table>
        }
      </div >
    )
  }
}

export default MyVote