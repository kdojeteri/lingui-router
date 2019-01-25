import * as React from "react";
import {Key, compile} from "path-to-regexp";
import * as pathToRegexp from "path-to-regexp";
import {I18n} from "@lingui/react";

export type I18nPath = string;

const Context = React.createContext<RouterI18n | null>(null);

interface LinguiRouterProps {
  catalogs: { [locale: string]: object },
  children: React.ReactNode
}

export const LinguiRouter = ({catalogs, children}: LinguiRouterProps) => (
  <I18n>{({i18n}) => (
    <Context.Provider value={new RouterI18n(i18n.language, catalogs)}>{children}</Context.Provider>
  )}</I18n>
);

export const WithLinguiRouter = ({children}: { children: (routerI18n: RouterI18n) => React.ReactNode }) => (
  <Context.Consumer>{(routerI18n) => {
    if (!routerI18n) {
      throw new ReferenceError("You forgot to wrap your app in <LinguiRouter />");
    }
    return children(routerI18n);
  }}</Context.Consumer>
);


function RRMatch(pattern: string, path: string): object | null {
  const keys: Key[] = [];
  const regexp = pathToRegexp(pattern, keys);
  const values = regexp.exec(path);

  if (!values) {
    return null;
  }

  const params = {};
  for (let [index, key] of keys.entries()) {
    params[key.name] = values[index + 1];
  }

  return params;
}

export class RouterI18n {
  constructor(public locale: string, public routeCatalogs: { [locale: string]: object }) {
  }

  get currentCatalog() {
    return this.routeCatalogs[this.locale]
  }

  /**
   * Translate route path for the current locale
   * @param path
   */
  route(path?: string): string {
    return '/' + this.locale + (this.currentCatalog[path || ''] || path || '');
  }

  /**
   * Translate link template literal for the current locale
   *
   * @param path
   */
  link(path: string): string {
    const url = new URL(path, "lingui-router://empty"); // use placeholder base, we're not using it anyway
    const found = this.matchCatalogKey(url.pathname);

    if (!found) {
      const language = Object.keys(this.routeCatalogs).find(lang => url.pathname.startsWith('/' + lang));

      if (language) {
        return path
      } else {
        return '/' + this.locale + path;
      }
    }

    const value = this.currentCatalog[found.key] || found.key;

    url.pathname = '/' + this.locale + compile(value)(found.match);

    return url.pathname + url.search + url.hash;
  }

  untranslateLocation(pathname: string) {
    // detect language
    const language = Object.keys(this.routeCatalogs).find(lang => pathname.startsWith('/' + lang));

    if (!language) {
      return pathname;
    }

    const lookupValue = pathname.substr(('/' + language).length);

    const found = this.matchCatalogValue(lookupValue, this.routeCatalogs[language]);

    if (!found) {
      return lookupValue;
    }

    return compile(found.key)(found.match);
  }

  matchCatalogKey(untranslatedPath: string, catalog = this.currentCatalog): { key: string, match: object } | null {
    for (let key of Object.keys(catalog)) {
      const match = RRMatch(key, untranslatedPath);
      if (match) {
        return {key, match};
      }
    }

    return null;
  }

  matchCatalogValue(translatedPath: string, catalog = this.currentCatalog): { key: string, match: object } | null {
    for (let [key, value] of Object.entries(catalog)) {
      const match = RRMatch(value, translatedPath);
      if (match) {
        return {key, match};
      }
    }

    return null;
  }
}

