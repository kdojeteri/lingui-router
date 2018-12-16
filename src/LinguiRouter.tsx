import * as React from "react";
import {Route as RRRoute, RouteProps} from "react-router";
import {Key, parse} from "path-to-regexp";
import {I18n} from "@lingui/core"
import {withI18n} from "@lingui/react";

export type I18nPath = [string[], any[]];

type RouteComponentType = React.ComponentType<RouteProps & { originalPath?: string }>;

const Context = React.createContext<RouterI18n | null>(null);

export const LinguiRouter = withI18n()(
  ({i18n, routeComponent = RRRoute, children}: { i18n: I18n, routeComponent?: RouteComponentType, children: React.ReactNode }) => (
    <Context.Provider value={new RouterI18n(i18n, routeComponent)}>{children}</Context.Provider>
  ));

export const WithLinguiRouter = ({children}: { children: (routerI18n: RouterI18n) => React.ReactNode }) => (
  <Context.Consumer>{(routerI18n) => {
    if (!routerI18n) {
      throw new ReferenceError("You forgot to wrap your app in <LinguiRouter />");
    }
    return children(routerI18n);
  }}</Context.Consumer>
);


export class RouterI18n {
  constructor(public i18n: I18n, public RouteComponent: RouteComponentType) {
  }

  private routeCache = {};

  route(string?: string): string {
    // Take a string like /course/:courseSlug/lesson/:lessonId/:lessonSlug
    let parsedPath = this.routeCache[string || ''];
    if (!parsedPath) {
      this.routeCache[string || ''] = parsedPath = parse(string || '');
    }

    // Turn it into catalog string like /course/{0}/lesson/{1}/{2}
    let placeholders: Key[] = [];
    const catalogString = parsedPath.map(
      function (item: any) {
        if (typeof item === "string") {
          return item;
        } else {
          placeholders.push(item);
          return `{${placeholders.length - 1}}`;
        }
      }
    ).join('');

    // Take translation from i18n._(...) (/kurz/{0}/lekce/{1}/{2})
    // Format with placeholder names (/kurz/:courseSlug/lekce/:lessonId/:lessonSlug)
    // Prepend with language and return (/cs/kurz/:courseSlug/lekce/:lessonId/:lessonSlug)

    return '/' + this.i18n.language + this.i18n._(catalogString, placeholders.map(key => key.delimiter + ':' + key.name));
  }

  link(parts: ArrayLike<string>, values: any[]): string {
    // Take a string template literal like `/course/${course.slug}/lesson/${uuidToBase64(lesson.uuid)}/${slugify(lesson.name)}`
    // Turn it into catalog string like /course/{0}/lesson/{1}/{2}
    const catalogString = Array.from(parts).map((part, i, arr) => (i === arr.length - 1) ? part : `${part}{${i}}`).join('');

    // Take translation from i18n._(...) (/kurz/{0}/lekce/{1}/{2})
    // Format with values names (/kurz/linux/lekce/8iJ22-BAF349/zaciname)
    // Prepend with language and return (/cs/kurz/linux/lekce/8iJ22-BAF349/zaciname)
    return '/' + this.i18n.language + this.i18n._(catalogString, values);
  }
}

