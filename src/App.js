import React, { Component } from 'react'
import FifaWorldCupContract from '../build/contracts/FifaWorldCup.json'
import getWeb3 from './utils/getWeb3'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col
} from 'reactstrap';
import { Route } from 'react-router-dom'
import Admin from './Admin'
import MyVote from './MyVote'
import Home from './Home'

import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      storageValue: 0,
      web3: null,
      web3Avail: true,
      fifaContract: null,
      gameCount: 0,
      games: [],
      fetchInProgress: true,
      isAdmin: false
    }
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
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
        this.setState({ web3Avail: false })
      })
  }

  instantiateContract() {
    const adminAccounts = [
      '0x627306090abab3a6e1400e9345bc60c78a8bef57',
      '0x8d012fa42370add6268b547d955eef603c89821a'
    ]

    const contract = require('truffle-contract')
    const fifaWorldCup = contract(FifaWorldCupContract)
    fifaWorldCup.setProvider(this.state.web3.currentProvider)
    this.setState({ fifaContract: fifaWorldCup })
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup.deployed().then((_instance) => {
        return _instance.getGameCount({ from: accounts[0] })
      }).then((result) => {
        this.setState({ gameCount: result });
        var account = accounts[0]
        // console.log("account[0]: " + account + "type: " + typeof(account))
        if (adminAccounts.includes(account)) {
          console.log("== ! setting isAdmin true ! ==")
          this.setState({isAdmin: true})
        }
        // console.log("= app.js gameCoutn: " + result)
      })
    })
    let contractInstance
    var promises = []
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
              // console.log("== game: " + _game)
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

  render() {
    const MyHomePage = (props) => {
      return (
        <Home
          extensionAvail={this.state.web3Avail}
          fetchInProgress={this.state.fetchInProgress}
          games={this.state.games}
          {...props}
        />
      );
    }
    const MyAdmin = (props) => {
      return (
        <Admin
          extensionAvail={this.state.web3Avail}
          fetchInProgress={this.state.fetchInProgress}
          games={this.state.games}
          {...props}
        />
      );
    }
    const MyMyVote = (props) => {
      return (
        <MyVote
          extensionAvail={this.state.web3Avail}
          fetchInProgress={this.state.fetchInProgress}
          games={this.state.games}
          {...props}
        />
      );
    }


    /* About component */
    const About = () => (
      <div>
        <p>
          Vote with your Eth and win Eth on teams you believe in!
        </p>
      </div>
    )

    return (
      <div className="App">
        <div className="container">
          <Navbar color="light" light expand="md">
            <NavbarBrand href="/">EtherFIFA!</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                {
                  this.state.web3 && this.state.isAdmin && (
                    <NavItem>
                      <NavLink href="/admin">
                        Admin
                      </NavLink>
                    </NavItem>
                  )
                }
                {
                  this.state.web3 && (
                    <NavItem>
                      <NavLink href="/myVote">
                        My Vote
                      </NavLink>
                    </NavItem>
                  )
                }
                <NavItem>
                  <NavLink href="/about">
                    About
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
          <div className="jumbotron" id="myJumbotron">
            <Route exact={true} path="/" render={MyHomePage} />
            {this.state.web3 && this.state.isAdmin && (
              <Route path="/admin" render={MyAdmin} />)}
            {this.state.web3 && (
              <Route path="/myVote" render={MyMyVote} />)}
            <Route path="/about" component={About} />
          </div>
          <footer>
            <Row>
              <Col sm="12" md="12" lg="12">
                <p className="align-self-center">
                  Enjoy the Game.
                </p>
              </Col>
            </Row>
          </footer>
        </div>
      </div>
    );
  }
}

export default App
