import React, { Component } from "react";
import FifaWorldCupContract from "../build/contracts/FifaWorldCup.json";
import getWeb3 from "./utils/getWeb3";
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
} from "reactstrap";
import { Route } from "react-router-dom";
import Admin from "./Admin";
import MyVote from "./MyVote";
import Home from "./Home";
import { FormattedMessage, IntlProvider, addLocaleData } from "react-intl";
import locale_en from "react-intl/locale-data/en";
import locale_zh from "react-intl/locale-data/zh";
import messages_zh from "./translations/cn.json";
import messages_en from "./translations/en.json";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

const messages = {
  zh: messages_zh,
  en: messages_en
};

addLocaleData([...locale_en, ...locale_zh]);

import "./App.css";

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      storageValue: 0,
      web3: null,
      web3Avail: true,
      fifaContract: null,
      gameCount: 0,
      games: [],
      fetchInProgress: true,
      isAdmin: false,
      locale: "en"
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  changeLocal(_locale) {
    const { cookies } = this.props;
    this.setState({ locale: _locale });
    cookies.set("locale", _locale);
  }
  componentWillMount() {
    const { cookies } = this.props;
    var _locale = cookies.get("locale");
    if (_locale) {
      this.setState({ locale: _locale });
    } else {
      const language = navigator.language.split(/[-_]/)[0]; // language without region code
      this.setState({ locale: language });
    }

    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });
        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log("Error finding web3.");
        this.setState({ web3Avail: false });
      });
  }

  instantiateContract() {
    const adminAccounts = [
      "0x627306090abab3a6e1400e9345bc60c78a8bef57",
      "0x8d012fa42370add6268b547d955eef603c89821a"
    ];

    const contract = require("truffle-contract");
    const fifaWorldCup = contract(FifaWorldCupContract);
    fifaWorldCup.setProvider(this.state.web3.currentProvider);
    this.setState({ fifaContract: fifaWorldCup });
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup
        .deployed()
        .then(_instance => {
          return _instance.getGameCount({ from: accounts[0] });
        })
        .then(result => {
          this.setState({ gameCount: result });
          var account = accounts[0];
          // console.log("account[0]: " + account + "type: " + typeof(account))
          if (adminAccounts.includes(account)) {
            console.log("== ! setting isAdmin true ! ==");
            this.setState({ isAdmin: true });
          }
          // console.log("= app.js gameCoutn: " + result)
        });
    });
    let contractInstance;
    var promises = [];
    this.state.web3.eth.getAccounts((error, accounts) => {
      fifaWorldCup
        .deployed()
        .then(_instance => {
          contractInstance = _instance;
          return _instance.getGameCount({ from: accounts[0] });
        })
        .then(result => {
          // console.log("= GameBoard: getGameCount: " + result);
          this.setState({ gameCount: result });
          for (let i = 0; i < result; i++) {
            var innerRequests = [
              contractInstance.getTeamA(i, { from: accounts[0] }),
              contractInstance.getTeamB(i, { from: accounts[0] }),
              contractInstance.getStartTime(i, { from: accounts[0] }),
              contractInstance.getWinVote(i, { from: accounts[0] }),
              contractInstance.getDrawVote(i, { from: accounts[0] }),
              contractInstance.getLoseVote(i, { from: accounts[0] })
            ];
            promises.push(Promise.all(innerRequests));
          }
          Promise.all(promises).then(innerPromise => {
            Promise.all(innerPromise).then(result => {
              // console.log(JSON.parse(result)
              result.forEach((_game, i) => {
                // console.log("== game: " + _game)
                var game = {
                  teamA: _game[0],
                  teamB: _game[1],
                  startTime: _game[2],
                  win: this.state.web3.fromWei(_game[3], "ether"),
                  draw: this.state.web3.fromWei(_game[4], "ether"),
                  lose: this.state.web3.fromWei(_game[5], "ether"),
                  imagePathA: _game[0]
                    ? "./imgs/" +
                      _game[0]
                        .trim()
                        .toLowerCase()
                        .substring(0, 3) +
                      ".png"
                    : "./imgs/rus.png",
                  imagePathB: _game[1]
                    ? "./imgs/" +
                      _game[1]
                        .trim()
                        .toLowerCase()
                        .substring(0, 3) +
                      ".png"
                    : "./imgs/rus.png"
                };
                this.state.games.push(game);
              });
              this.setState({ fetchInProgress: false });
            });
          });
        });
    });
  }

  render() {
    const MyHomePage = props => {
      return (
        <Home
          extensionAvail={this.state.web3Avail}
          fetchInProgress={this.state.fetchInProgress}
          games={this.state.games}
          gameCount={this.state.gameCount}
          {...props}
        />
      );
    };
    const MyAdmin = props => {
      return (
        <Admin
          extensionAvail={this.state.web3Avail}
          fetchInProgress={this.state.fetchInProgress}
          games={this.state.games}
          {...props}
        />
      );
    };
    const MyMyVote = props => {
      return (
        <MyVote
          extensionAvail={this.state.web3Avail}
          fetchInProgress={this.state.fetchInProgress}
          games={this.state.games}
          {...props}
        />
      );
    };

    /* About component */
    const About = () => (
      <div>
        <p>
          <FormattedMessage
            id="app.aboutDetail"
            defaultMessage="Vote with your Eth and win Eth on teams you believe in!"
          />
        </p>
      </div>
    );

    /* About component */
    const Contact = () => (
      <div className="justify-content-center">
        <Row className="contact-row justify-content-center">
          <h1>
            <FormattedMessage
              id="app.contactMsg"
              defaultMessage="Let's get in touch"
            />
          </h1>
        </Row>
        <Row className="justify-content-center">
          {/* <Col xs="auto">
            {" "}
            <img
              className="wechat"
              alt="wechat"
              src={require("./imgs/wechat.png")}
              onMouseOver={e => (e.currentTarget.src = require('./imgs/wechat.jpg'))}
              onMouseOut={e => (e.currentTarget.src = require('./imgs/wechat.png'))}
            />
          </Col> */}
          <Col xs="auto">
            <a
              href="https://t.me/joinchat/G0ZCAQ4ICtTMfikFSin4yA"
              target="_blank"
            >
              <img
                className="telegram"
                alt="telegram"
                src={require("./imgs/telegram.png")}
              />
            </a>
          </Col>
          <Col xs="auto">
            <a href="https://discord.gg/WCRnW7r" target="_blank">
              {" "}
              <img
                className="discord"
                alt="discord"
                src={require("./imgs/discord.png")}
              />
            </a>
          </Col>
        </Row>
      </div>
    );

    return (
      <div className="App">
        <IntlProvider
          locale={this.state.locale}
          messages={messages[this.state.locale]}
        >
          <div className="container">
            <Navbar color="light" light expand="md">
              <NavbarBrand href="/">EtherFIFA!</NavbarBrand>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="ml-auto" navbar>
                  {this.state.web3 &&
                    this.state.isAdmin && (
                      <NavItem>
                        <NavLink href="/admin">Admin</NavLink>
                      </NavItem>
                    )}
                  {this.state.web3 && (
                    <NavItem>
                      <NavLink href="/myVote">
                        {" "}
                        <FormattedMessage
                          id="app.myvote"
                          defaultMessage="My Vote"
                        />
                      </NavLink>
                    </NavItem>
                  )}
                  <NavItem>
                    <NavLink href="/contact">
                      <FormattedMessage
                        id="app.contact"
                        defaultMessage="Contact"
                      />
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink href="/about">
                      {" "}
                      <FormattedMessage id="app.about" defaultMessage="About" />
                    </NavLink>
                  </NavItem>
                  <NavItem onClick={this.changeLocal.bind(this, "zh")}>
                    <NavLink>中文</NavLink>
                  </NavItem>
                  <NavItem onClick={this.changeLocal.bind(this, "en")}>
                    <NavLink>English</NavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </Navbar>
            <div className="jumbotron" id="myJumbotron">
              <Route exact={true} path="/" render={MyHomePage} />
              {this.state.web3 &&
                this.state.isAdmin && <Route path="/admin" render={MyAdmin} />}
              {this.state.web3 && <Route path="/myVote" render={MyMyVote} />}
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
            </div>
            <footer>
              <Row className="justify-content-center">
                <Col xs="auto">
                  <div>Enjoy the Game. EtherFIFA 2018</div>
                </Col>
              </Row>
            </footer>
          </div>
        </IntlProvider>
      </div>
    );
  }
}

export default withCookies(App);
