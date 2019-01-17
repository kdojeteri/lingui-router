import {
  Route as RRRoute,
  RouteChildrenProps,
  RouteComponentProps as RRRouteComponentProps,
  Switch as RRSwitch,
  SwitchProps
} from "react-router";
import * as React from "react";
import {RouterI18n, WithLinguiRouter} from "./LinguiRouter";
import {equals, flatten} from 'ramda';
import {compile} from "path-to-regexp";
import * as H from "history";

export interface RouteProps {
  // FIXME: copied over from react-router types, because portal keeps getting this error:
  // ERROR in [at-loader] ./node_modules/lingui-router/dist/RouteComponents.d.ts:4:18
  //     TS2430: Interface 'import("C:/Users/peping/Documents/projects/portal-front/node_modules/lingui-router/dist/RouteComponents").RouteProps' incorrectl
  // y extends interface 'import("C:/Users/peping/Documents/projects/portal-front/node_modules/@types/react-router/index").RouteProps'.
  //   Types of property 'render' are incompatible.
  //     Type '((props: RouteComponentProps<any>) => ReactNode) | undefined' is not assignable to type '((props: RouteComponentProps<any, StaticContext, any
  // >) => ReactNode) | undefined'.
  //       Type '(props: RouteComponentProps<any>) => ReactNode' is not assignable to type '(props: RouteComponentProps<any, StaticContext, any>) => ReactNo
  // de'.
  //         Types of parameters 'props' and 'props' are incompatible.
  //           Type 'RouteComponentProps<any, StaticContext, any>' is not assignable to type 'RouteComponentProps<any>'.
  //             Types of property 'location' are incompatible.
  //               Type 'Location<any>' is not assignable to type 'LinguiRouterLocation'.
  //                 Property 'translated' is missing in type 'Location<any>'.
  location?: H.Location;
  component?: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  render?: ((props: RouteComponentProps<any>) => React.ReactNode);
  children?: ((props: RouteChildrenProps<any>) => React.ReactNode) | React.ReactNode;
  path?: string | string[];
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;

  key?: string;
}

export interface RouteComponentProps<T> extends RRRouteComponentProps<T> {
  location: LinguiRouterLocation
}

export interface LinguiRouterLocation extends H.Location<any> {
  translated: H.Location<any>;
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

export class Route extends React.Component<RouteProps> {
  prevProps = this.props;
  prevRouter: RouterI18n | null = null;
  route: any = null;

  render() {
    return <WithLinguiRouter>{(routerI18n) => {
      let route;
      if (!equals(this.props, this.prevProps) || !equals(this.prevRouter, routerI18n)) {
        this.route = route = renderRoute(routerI18n, this.props);
        this.prevProps = this.props;
        this.prevRouter = routerI18n;
      }
        return <RRSwitch>{route}</RRSwitch>;
    }}</WithLinguiRouter>;
  }
}

export class Switch extends React.Component<SwitchProps> {
  prevChildren = this.props.children;
  routeMap: any = null;
  prevRouter: RouterI18n | null = null;

  render() {
    return (
      <WithLinguiRouter>{(routerI18n) => {
        let routeMap = this.routeMap;
        if (!equals(this.props.children, this.prevChildren) || !equals(routerI18n, this.prevRouter)) {
          this.routeMap = routeMap = flatten(
            React.Children.map(this.props.children, (el, index) =>
              React.isValidElement(el)
                ? renderRoute(routerI18n, {...el.props, key: index.toString()})
                : el
            )
          );
          this.prevChildren = this.props.children;
          this.prevRouter = routerI18n;
        }

        return (
          <RRSwitch>{routeMap}</RRSwitch>
        );
      }}</WithLinguiRouter>
    );
  }
}
