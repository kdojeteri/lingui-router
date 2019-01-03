import {mount} from "enzyme";
import {I18nProvider} from "@lingui/react";
import {Router} from "react-router";
import createMemoryHistory from "history/createMemoryHistory";
import {LinguiRouter} from "./LinguiRouter";
import {Link} from "./LinkComponents";
import {i18nTo} from "./templateTags";
import * as React from "react";

describe('Link', () => {
  it('should prepend all links with current language', () => {
    const app = mount(
      <I18nProvider language={'cs'}>
        <Router history={createMemoryHistory()}>
          <LinguiRouter><Link to={i18nTo`/test`}>foo</Link></LinguiRouter>
        </Router>
      </I18nProvider>
    );

    expect(app.find('a').prop('href')).toEqual('/cs/test');
  });

  it('should translate plain links', () => {
    const app = mount(
      <I18nProvider language={'en'} catalogs={{"en": {"messages": {"/test": "/success"}}}}>
        <Router history={createMemoryHistory()}>
          <LinguiRouter><Link to={i18nTo`/test`}>foo</Link></LinguiRouter>
        </Router>
      </I18nProvider>
    );

    expect(app.find('a').prop('href')).toEqual('/en/success');
  });

  it('should translate links with path parameters', () => {
    const app = mount(
      <I18nProvider language={'en'} catalogs={{"en": {"messages": {"/test-param-id/{0}": "/successful-id-test/{0}"}}}}>
        <Router history={createMemoryHistory()}>
          <LinguiRouter><Link to={i18nTo`/test-param-id/${10}`}>foo</Link></LinguiRouter>
        </Router>
      </I18nProvider>
    );

    expect(app.find('a').prop('href')).toEqual('/en/successful-id-test/10');
  });
});
