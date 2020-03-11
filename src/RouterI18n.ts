import {match as RRMatch} from "react-router";
import pathToRegexp, {compile, Key} from "path-to-regexp";
import * as H from "history";

interface MatchOptions {
  exact?: boolean;
  sensitive?: boolean;
}

function matchPath<T>(pattern: string, path: string, options: MatchOptions = {}): RRMatch<T> | null {
  const exact = options.exact !== false;

  const keys: Key[] = [];
  const regexp = pathToRegexp(pattern, keys, {end: exact, sensitive: !!options.sensitive});
  const values = regexp.exec(path);

  if (!values) {
    return null;
  }

  const params: T = {} as T;
  for (let [index, key] of keys.entries()) {
    params[key.name] = values[index + 1];
  }

  return {
    params,
    isExact: exact,
    path: pattern,
    url: ""
  };
}

interface FindMatchOptions {
  catalog?: object
  match?: MatchOptions
}

export class RouterI18n {
  constructor(public locale: string, public routeCatalogs: { [locale: string]: object }) {
  }

  getCatalog() {
    return this.routeCatalogs[this.locale]
  }

  /**
   * Translate route path for the current locale
   * @param path
   */
  route(path: string | string[] | undefined) {
    if (Array.isArray(path)) {
      return path.map(path => '/' + this.locale + (this.getCatalog()[path] || path))
    } else {
      return '/' + this.locale + (this.getCatalog()[path || ''] || path || '');
    }
  }

  /**
   * Translate link template literal for the current locale
   *
   * @param path
   */
  link(path: string): string {
    const url = new URL(path, "https://garbage-placeholder/"); // use placeholder base, we're not using it anyway
    const found = this.findUntranslatedMatch(url.pathname, {match: {exact: true}});

    if (!found) {
      const language = Object.keys(this.routeCatalogs).find(lang => url.pathname.startsWith('/' + lang));

      if (language) {
        return path
      } else {
        return '/' + this.locale + path;
      }
    }

    const value = this.getCatalog()[found.path] || found.path;

    url.pathname = '/' + this.locale + compile(value)(found.params);

    return url.pathname + url.search + url.hash;
  }

  normalizeLocation(location: H.Location): TranslatedLocation {
    return {
      ...location,
      pathname: this.untranslatePathname(location.pathname, {exact: true}),
      original: location
    }
  }

  untranslatePathname(pathname: string, matchOpts?: MatchOptions): string {
    // detect language
    const language = Object.keys(this.routeCatalogs).find(lang => pathname.startsWith('/' + lang));

    if (!language) {
      return pathname;
    }

    const lookupValue = pathname.substr(('/' + language).length);

    const found = this.findTranslatedMatch(lookupValue, {catalog: this.routeCatalogs[language], match: matchOpts});

    if (!found) {
      return pathname;
    }

    return compile(found.original.path)(found.params);
  }

  findUntranslatedMatch<T extends {}>(untranslatedPath: string, opts: FindMatchOptions = {}): TranslatedMatch<T> | null {
    const catalog = opts.catalog || this.getCatalog();
    const matchOpts = opts.match || {};

    for (let key of Object.keys(catalog)) {
      const match = matchPath<T>(key, untranslatedPath, matchOpts);
      if (match) {
        return {
          ...match,
          original: match
        };
      }
    }

    return null;
  }

  findTranslatedMatch<T extends {}>(translatedPath: string, opts: FindMatchOptions = {}): TranslatedMatch<T> | null {
    const catalog = opts.catalog || this.getCatalog();
    const matchOpts = opts.match || {};

    for (let [key, value] of Object.entries(catalog)) {
      const match = matchPath<T>(value, translatedPath, matchOpts);
      if (match) {
        return {
          ...match,
          original: {
            ...match,
            path: key
          }
        };
      }
    }

    return null;
  }

  match<T>(pattern: string, pathname: string, opts: MatchOptions = {}): TranslatedMatch<T> | null {
    const match = matchPath<T>(pattern, this.untranslatePathname(pathname), opts);
    return match && {
      ...match,
      original: {
        ...match,
        path: pathname
      }
    }
  }
}

export interface TranslatedMatch<T = {}> extends RRMatch<T> {
  original: RRMatch<T>
}

export interface TranslatedLocation extends H.Location {
  original: H.Location
}

export function isTranslatedMatch<T>(match: undefined | null | RRMatch<T> | TranslatedMatch<T>): match is TranslatedMatch<T> {
  return match ? 'original' in match : false
}
