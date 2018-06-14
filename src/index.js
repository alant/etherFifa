import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Route } from "react-router-dom";
import ReactGA from "react-ga";
import PropTypes from "prop-types";
import { CookiesProvider } from "react-cookie";

ReactGA.initialize("UA-120518360-1");

class GAListener extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  componentDidMount() {
    this.sendPageView(this.context.router.history.location);
    this.context.router.history.listen(this.sendPageView);
  }

  sendPageView(location) {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  }

  render() {
    return this.props.children;
  }
}

ReactDOM.render(
  <BrowserRouter>
    <GAListener>
      <CookiesProvider>
        <Route component={App} />
      </CookiesProvider>
    </GAListener>
  </BrowserRouter>,
  document.getElementById("root")
);
