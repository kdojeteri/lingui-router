import {
  Link as RRLink,
  LinkProps as RRLinkProps,
  NavLink as RRNavLink,
  NavLinkProps as RRNavLinkProps,
  Redirect as RRRedirect,
  RedirectProps as RRRedirectProps
} from "react-router-dom";
import * as React from "react";
import {I18nPath, WithLinguiRouter} from "./LinguiRouter";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export interface LinkProps extends Omit<RRLinkProps, "to"> {
  to: string | I18nPath
}

export const Link = ({to, ...otherProps}: LinkProps) => (<WithLinguiRouter>{router => (
  <RRLink to={typeof to === 'string' ? to : router.link(to[0], to[1])} {...otherProps}/>
)}</WithLinguiRouter>);

export interface NavLinkProps extends Omit<RRNavLinkProps, "to"> {
  to: string | I18nPath
}

export const NavLink = ({to, ...otherProps}: NavLinkProps) => (<WithLinguiRouter>{router => (
  <RRNavLink to={typeof to === 'string' ? to : router.link(to[0], to[1])} {...otherProps}/>
)}</WithLinguiRouter>);

export interface RedirectProps extends Omit<RRRedirectProps, "to"> {
  to: string | I18nPath
}

export const Redirect = ({to, ...otherProps}: RedirectProps) => (<WithLinguiRouter>{router => (
  <RRRedirect to={typeof to === 'string' ? to : router.link(to[0], to[1])} {...otherProps}/>
)}</WithLinguiRouter>);
