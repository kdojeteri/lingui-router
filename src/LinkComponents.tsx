import {
  Link as RRLink,
  LinkProps as RRLinkProps,
  NavLink as RRNavLink,
  NavLinkProps as RRNavLinkProps,
  Redirect as RRRedirect,
  RedirectProps as RRRedirectProps
} from "react-router-dom";
import * as React from "react";
import {WithLinguiRouter} from "./LinguiRouter";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export interface LinkProps extends Omit<RRLinkProps, "to"> {
  to: string
}

export const Link = ({to, ...otherProps}: LinkProps) => (<WithLinguiRouter>{router => (
  <RRLink to={router.link(to)} {...otherProps}/>
)}</WithLinguiRouter>);

export interface NavLinkProps extends Omit<RRNavLinkProps, "to"> {
  to: string
}

export const NavLink = ({to, ...otherProps}: NavLinkProps) => (<WithLinguiRouter>{router => (
  <RRNavLink to={router.link(to)} {...otherProps}/>
)}</WithLinguiRouter>);

export interface RedirectProps extends Omit<RRRedirectProps, "to"> {
  to: string
}

export const Redirect = ({to, ...otherProps}: RedirectProps) => (<WithLinguiRouter>{router => (
  <RRRedirect to={router.link(to)} {...otherProps}/>
)}</WithLinguiRouter>);
