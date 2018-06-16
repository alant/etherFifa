import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FormattedMessage } from "react-intl";

class ResultCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {}
  render() {
    const FlagImgA = ({ Index }) => {
      return (
        <div className="flag-container-a">
          <img
            className="national-flag"
            alt="flag"
            src={require(this.props.game.imagePathA)}
          />
        </div>
      );
    };
    const FlagImgB = ({ Index }) => {
      return (
        <div className="flag-container-b">
          <img
            className="national-flag"
            alt="flag"
            src={require(this.props.game.imagePathB)}
          />
        </div>
      );
    };
    const GameResult = () => {
      return (
        <div className="flag-container justify-content-md-center">
          <div className="left-team">
            <FlagImgA Index={this.props.i} />
            <FormattedMessage id={"team." + this.props.i + ".a"} />
          </div>
          <div className="vs-text-container">
            {this.props.gameResult.teamA} : {this.props.gameResult.teamB}
          </div>
          <div className="right-team">
            <FormattedMessage id={"team." + this.props.i + ".b"} />
            <FlagImgB Index={this.props.i} />
          </div>
        </div>
      );
    };
    return (
      <div className="result-card">
        <Modal
          isOpen={this.props.open}
          toggle={this.props.toggle}
          className={this.props.className}
        >
          <ModalHeader toggle={this.props.toggle}>
            <FormattedMessage id="app.gameOverModalTitle" />
          </ModalHeader>
          <ModalBody className="game-result-modal-body">
            <GameResult />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.props.toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ResultCard;
