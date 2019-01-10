import {mount} from "enzyme";
import {I18nProvider} from "@lingui/react";
import {Router} from "react-router";
import createMemoryHistory from "history/createMemoryHistory";
import {LinguiRouter} from "./LinguiRouter";
import {Link} from "./LinkComponents";
import * as React from "react";

describe('Link', () => {
  it('should prepend all links with current language', () => {
    const app = mount(
      <I18nProvider language={'cs'}>
        <Router history={createMemoryHistory()}>
          <LinguiRouter catalogs={{cs: {'/test': '/test'}}}><Link to={`/test`}>foo</Link></LinguiRouter>
        </Router>
      </I18nProvider>
    );

    expect(app.find('a').prop('href')).toEqual('/cs/test');
  });

  it('should translate plain links', () => {
    const app = mount(
      <I18nProvider language={'en'}>
        <Router history={createMemoryHistory()}>
          <LinguiRouter catalogs={{en: {'/test': '/success'}}}><Link to={`/test`}>foo</Link></LinguiRouter>
        </Router>
      </I18nProvider>
    );

    expect(app.find('a').prop('href')).toEqual('/en/success');
  });

  it('should translate links with path parameters', () => {
    const app = mount(
      <I18nProvider language={'en'}>
        <Router history={createMemoryHistory()}>
          <LinguiRouter catalogs={{en: {'/test-param-id/:id': '/successful-id-test/:id'}}}><Link to={`/test-param-id/${10}`}>foo</Link></LinguiRouter>
        </Router>
      </I18nProvider>
    );

    expect(app.find('a').prop('href')).toEqual('/en/successful-id-test/10');
  });
});
