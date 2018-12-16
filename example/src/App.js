import React, { Component } from 'react'
import {Router} from "react-router";
import {LinguiRouter, NavLink, i18nTo, Route} from "lingui-router";
import {I18nProvider, Trans} from "@lingui/react";
import {createBrowserHistory} from "history";


export default class App extends Component {
  render () {
    return (
      <I18nProvider language={'cs'}>
        <Router history={createBrowserHistory()}>
          <LinguiRouter>
            <h1><Trans>Welcome to <code>lingui-router</code>!</Trans></h1>
            <nav><ul>
              <li><NavLink to={i18nTo`/`}>Homepage</NavLink></li>
              <li><NavLink to={i18nTo`/about-library`}>About library</NavLink></li>
            </ul></nav>
            <Route path='/'>{({originalPath}) => <p>{originalPath}</p> }</Route>
          </LinguiRouter>
        </Router>
      </I18nProvider>
    )
  }
}


