import {
  Route as RRRoute,
  RouteProps as RRRouteProps,
  RouteComponentProps as RRRouteComponentProps,
  Switch as RRSwitch,
  SwitchProps
} from "react-router";
import * as React from "react";
import {RouterI18n, WithLinguiRouter} from "./LinguiRouter";
import {flatten} from 'ramda';

export interface RouteProps extends RRRouteProps {
  component?: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  render?: ((props: RouteComponentProps<any>) => React.ReactNode);
  children?: ((props: RouteComponentProps<any>) => React.ReactNode) | React.ReactNode;

  key?: string;
}

export interface RouteComponentProps<T> extends RRRouteComponentProps<T> {
  originalPath: string | undefined
}

function renderRoute(routerI18n: RouterI18n, {path, component, render, children, key, ...otherProps}: RouteProps) {
  if (Array.isArray(path)) {
    throw RangeError('Array paths not supported');
  }

  const a: React.ComponentType<RouteComponentProps<any>> | undefined = component;
  const b = render as (React.ComponentType<RouteComponentProps<any>> | undefined);
  const c = typeof children === 'function' ? (children as React.ComponentType<RouteComponentProps<any>>) : undefined;


  const Component = a || b || c || undefined;
  const NewComponent = (p: RRRouteComponentProps) => !Component ? null : <Component {...p} originalPath={path}/>;

  return [
    <RRRoute path={routerI18n.route(path)} component={NewComponent} key={`${key || 'route'}-i18n`} {...otherProps}/>,
    <RRRoute path={routerI18n.route(path)} component={NewComponent} key={key || 'route'} {...otherProps}/>,
  ];
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
