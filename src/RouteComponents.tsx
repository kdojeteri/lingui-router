import {
  Route as RRRoute,
  RouteComponentProps as RRRouteComponentProps,
  RouteProps as RRRouteProps,
  Switch as RRSwitch,
  SwitchProps
} from "react-router";
import * as React from "react";
import {RouterI18n, WithLinguiRouter} from "./LinguiRouter";
import {flatten} from 'ramda';
import {compile} from "path-to-regexp";
import * as H from "history";

export interface RouteProps extends RRRouteProps {
  component?: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  render?: ((props: RouteComponentProps<any>) => React.ReactNode);
  children?: ((props: RouteComponentProps<any>) => React.ReactNode) | React.ReactNode;

  key?: string;
}

export interface LinguiRouterLocation extends H.Location<any> {
  translated: H.Location<any>;

}

export interface RouteComponentProps<T> extends RRRouteComponentProps<T> {
  location: LinguiRouterLocation
}

function renderRoute(routerI18n: RouterI18n, {path, component, render, children, key, ...otherProps}: RouteProps) {
  if (Array.isArray(path)) {
    throw RangeError('Array paths not supported');
  }

  const a: React.ComponentType<RouteComponentProps<any>> | undefined = component;
  const b = render as (React.ComponentType<RouteComponentProps<any>> | undefined);
  const c = typeof children === 'function' ? (children as React.ComponentType<RouteComponentProps<any>>) : undefined;


  const Component = a || b || c || undefined;
  const NewComponent = (routeComponentProps: RRRouteComponentProps) => {
    if (!Component) {
      return null;
    }

    const untranslatedPath = path || '';
    const untranslatedPathname = formatRoute(untranslatedPath, routeComponentProps.match.params);

    const props = {
      ...routeComponentProps,
      match: {
        ...routeComponentProps.match,
        path: untranslatedPath
      },
      location: {
        ...routeComponentProps.location,
        pathname: untranslatedPathname,
        translated: routeComponentProps.location
      }
    };

    return <Component {...props}/>;
  };

  return [
    <RRRoute path={routerI18n.route(path)} component={NewComponent} key={`${key || 'route'}-i18n`} {...otherProps}/>,
    <RRRoute path={path} component={NewComponent} key={key || 'route'} {...otherProps}/>,
  ];
}

const compiledPathCache = {};

function formatRoute(path: string, params: object): string {
  let compiledPath = compiledPathCache[path];
  if (!compiledPath) {
    compiledPathCache[path] = compiledPath = compile(path);
  }

  return compiledPath(params);
}

export const Route = (props: RouteProps) => (
  <WithLinguiRouter>{(routerI18n) => <RRSwitch>{renderRoute(routerI18n, props)}</RRSwitch>}</WithLinguiRouter>);

export const Switch = ({children}: SwitchProps) => (<WithLinguiRouter>{(routerI18n) => (
  <RRSwitch>{flatten(
    React.Children.map(children, (el, index) =>
      React.isValidElement(el)
        ? renderRoute(routerI18n, {...el.props, key: index.toString()})
        : el
    )
  )}</RRSwitch>
)}</WithLinguiRouter>);
