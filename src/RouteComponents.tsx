import {RouteProps, Switch as RRSwitch, SwitchProps} from "react-router";
import * as React from "react";
import {flatten} from "ramda";
import {WithLinguiRouter} from "./LinguiRouter";

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
