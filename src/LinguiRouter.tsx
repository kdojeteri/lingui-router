import * as React from "react";
import {Route as RRRoute, RouteProps, Switch as RRSwitch, SwitchProps} from "react-router";
import {Key, parse} from "path-to-regexp";
import {I18n} from "@lingui/core"
import {withI18n} from "@lingui/react";
import {flatten} from "ramda";

export type I18nPath = [string[], any[]];

const Context = React.createContext<RouterI18n | null>(null);

export const LinguiRouter = withI18n()(({i18n}: { i18n: I18n }) => (
  <Context.Provider value={new RouterI18n(i18n, RRRoute)}/>
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
  constructor(public i18n: I18n, public RouteComponent: React.ComponentType<RouteProps & {originalPath?: string}>) {
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

export const Route = ({path, ...otherProps}: RouteProps) => (<WithLinguiRouter>{(routerI18n) => {
  if (Array.isArray(path)) {
    throw RangeError('Array paths not supported');
  }

  const Route = routerI18n.RouteComponent;

  return (
    <React.Fragment>
      <Route path={routerI18n.route(path)} originalPath={path} {...otherProps}/>
      <Route path={path} originalPath={path} {...otherProps}/>
    </React.Fragment>
  );
}}</WithLinguiRouter>);

export const Switch = ({children}: SwitchProps) => (<WithLinguiRouter>{(routerI18n) => (
  <RRSwitch>{
    flatten(
      React.Children.map(children, (el, index) => {
        if (React.isValidElement<{ path?: string }>(el)) {
          const {path, ...otherProps} = el.props;
          const Route = routerI18n.RouteComponent;

          return [
            <Route path={routerI18n.route(path)} originalPath={path} key={index + '-local'} {...otherProps}/>,
            <Route path={path} originalPath={path} key={index} {...otherProps}/>
          ];
        } else {
          return el;
        }
      })
    )
  }</RRSwitch>
)}</WithLinguiRouter>);

