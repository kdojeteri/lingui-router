import React, { Component } from 'react'
import {Router} from "react-router";
import {LinguiRouter} from "lingui-router";
import I18nProvider from "@lingui/react";


export default class App extends Component {
  render () {
    return (
      <I18nProvider>
        <Router>
          <LinguiRouter>

          </LinguiRouter>
        </Router>
      </I18nProvider>
    )
  }
}
