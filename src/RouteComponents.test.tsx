import {I18nProvider} from "@lingui/react";
import {Router} from "react-router";
import createMemoryHistory from "history/createMemoryHistory";
import * as React from "react";
import {mount} from "enzyme";
import {Route} from "./RouteComponents";
import {i18nPath} from "./templateTags";
import {LinguiRouter} from "./LinguiRouter";


describe('Route', () => {
  it('should not render anything for paths that are not recognized', () => {
    const history = createMemoryHistory();
    history.push('/bar');

    const app = mount(
      <I18nProvider language={'cs'}>
        <LinguiRouter>
          <Router history={history}>
            <Route path={i18nPath`/foo`} render={() => <span>Hello!</span>}/>
          </Router>
        </LinguiRouter>
      </I18nProvider>
    );


    expect(app.find('span').exists()).toBeFalsy();
  });

  it('should recognize paths without language prefix', () => {
    const history = createMemoryHistory();
    history.push('/foo');

    const app = mount(
      <I18nProvider language={'cs'}>
        <LinguiRouter>
          <Router history={history}>
            <Route path={i18nPath`/foo`} render={() => <span>Hello!</span>}/>
          </Router>
        </LinguiRouter>
      </I18nProvider>
    );

    expect(app.find('span').exists()).toBeTruthy();
  });

  it('should recognize paths with language prefix', () => {
    const history = createMemoryHistory();
    history.push('/cs/foo');

    const app = mount(
      <I18nProvider language={'cs'}>
        <LinguiRouter>
          <Router history={history}>
            <Route path={i18nPath`/foo`} render={() => <span>Hello!</span>}/>
          </Router>
        </LinguiRouter>
      </I18nProvider>
    );

    expect(app.find('span').exists()).toBeTruthy();
  });

  it('should see the untranslated path in match.path', () => {
    const history = createMemoryHistory();
    history.push('/cs/testovaci-cesta');

    const routeFunction = jest.fn(() => null);

    mount(
      <I18nProvider language={'cs'} catalogs={{cs: {messages: {'/testing-path': '/testovaci-cesta'}}}}>
        <LinguiRouter>
          <Router history={history}>
            <Route path={i18nPath`/testing-path`} render={routeFunction}/>
          </Router>
        </LinguiRouter>
      </I18nProvider>
    );

    expect(routeFunction.mock.calls[0][0]).toMatchObject({
      match: {path: '/testing-path'},
      location: {pathname: '/testing-path', translated: {pathname: '/cs/testovaci-cesta'}}
    });
  });

  it('should see the untranslated path with params in location.pathname', () => {
    const history = createMemoryHistory();
    history.push('/cs/testovaci-cesta/parametr');

    const routeFunction = jest.fn(() => null);

    mount(
      <I18nProvider language={'cs'} catalogs={{cs: {messages: {'/testing-path/{0}': a => ["/testovaci-cesta/",a("0")]}}}}>
        <LinguiRouter>
          <Router history={history}>
            <Route path={i18nPath`/testing-path/:param`} render={routeFunction}/>
          </Router>
        </LinguiRouter>
      </I18nProvider>
    );

    expect(routeFunction.mock.calls[0][0]).toMatchObject({
      match: {path: '/testing-path/:param'},
      location: {pathname: '/testing-path/parametr', translated: {pathname: '/cs/testovaci-cesta/parametr'}}
    });
  });
});
