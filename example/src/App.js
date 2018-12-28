import React, {Component} from 'react'
import {Route as RRRoute, Router} from "react-router";
import {i18nPath, i18nTo, LinguiRouter, NavLink, Route} from "lingui-router";
import {I18nProvider, Trans} from "@lingui/react";
import {createBrowserHistory} from "history";
import cs from './locale/cs/messages';
import en from './locale/en/messages';
import es from './locale/es/messages';
import fr from './locale/fr/messages';


export default class App extends Component {
  render() {
    return (
      <Router history={createBrowserHistory()}>
        <RRRoute path="/:locale?">{({match: {params: {locale}}}) => (
          <I18nProvider language={locale || 'cs'} catalogs={{cs, en, es, fr}}>
            <LinguiRouter>
              <h1><Trans>Welcome to <code>lingui-router</code>!</Trans></h1>
              <nav>
                <ul>
                  <li><NavLink to={i18nTo`/`}><Trans>Homepage</Trans></NavLink></li>
                  <li><NavLink to={i18nTo`/about-library`}><Trans>About library</Trans></NavLink></li>
                </ul>
              </nav>
              <Route path={i18nPath`/about-library`}>{({originalPath, location}) => (
                <Trans>
                  <p>You are at {location.pathname}</p>
                  <p>Originally called {originalPath}</p>
                </Trans>
              )}</Route>
            </LinguiRouter>
          </I18nProvider>
        )}</RRRoute>
      </Router>
    )
  }
}


