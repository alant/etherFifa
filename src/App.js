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
  Col,
  Alert
} from 'reactstrap';
import { Route } from 'react-router-dom'
import GameBoard from './GameBoard'
import Admin from './Admin'
import MyVote from './MyVote'

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
      gameCount: 0
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
      fifaWorldCup.deployed().then((_instance) => {
        return _instance.getGameCount({ from: accounts[0] })
      }).then((result) => {
        this.setState({ gameCount: result });
      })
    })
  }

  render() {

    /* Home component */
    const Home = function (props) {
      console.log("====home prop extension avail:" + props.extensionAvail);
      return (
        <div>
          {
            !props.extensionAvail && (
              <Alert color="warning">
                You need metamask to play this game.
              </Alert>
            )}
          <GameBoard />
        </div>
      );
    }
    const MyHome = (props) => {
      return (
        <Home
          extensionAvail={this.state.web3Avail}
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
                  this.state.web3 && (
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
            <Route exact={true} path="/" render={MyHome} />
            {this.state.web3 && (
              <Route path="/admin" component={Admin} />)}
            {this.state.web3 && (
              <Route path="/myVote" component={MyVote} />)}
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
