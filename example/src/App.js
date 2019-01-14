import React, {Component} from 'react'
import {Route as RRRoute, Router} from "react-router";
import {LinguiRouter, NavLink, Route} from "lingui-router";
import {I18nProvider, Trans} from "@lingui/react";
import {createBrowserHistory} from "history";
import cs from './locale/cs/messages';
import en from './locale/en/messages';
import es from './locale/es/messages';
import fr from './locale/fr/messages';

import csRoutes from './locale/cs/routes';
import enRoutes from './locale/en/routes';
import esRoutes from './locale/es/routes';
import frRoutes from './locale/fr/routes';


export default class App extends Component {
  render() {
    return (
      <Router history={createBrowserHistory()}>
        <RRRoute path="/:locale?">{({match: {params: {locale}}}) => (
          <I18nProvider language={locale || 'cs'} catalogs={{cs, en, es, fr}}>
            <LinguiRouter catalogs={{cs: csRoutes, en: enRoutes, es: esRoutes, fr: frRoutes}}>
              <h1><Trans> Welcome to <code>lingui-router</code>!</Trans></h1>
              <nav>
                <ul>
                  <li><NavLink to={"/"}><Trans>Homepage</Trans></NavLink></li>
                  <li><NavLink to={"/about-library"}><Trans>About library</Trans></NavLink></li>
                </ul>
              </nav>
              <Route path={"/about-library"}>{({location}) => (
                <Trans>
                  <p>You are at {location.translated.pathname}</p>
                  <p>Originally called {location.pathname}</p>
                </Trans>
              )}</Route>
            </LinguiRouter>
          </I18nProvider>
        )}</RRRoute>
      </Router>
    )
  }
}


