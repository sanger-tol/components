/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import {
  useAuth,
  getReturnUrlFromLocalStorage,
  setReturnUrlFromLocalStorage,
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  tokenHasExpired,
  Login,
  env,
  LoginIcon,
  RegisterIcon,
  PSmartApp,
  fetchEnvironment,
  getNavBackgroundClass,
  collectNavigationItems,
} from "..";


export interface PNavigation extends PSmartApp, RouteComponentProps { }

function Navigation(props: PNavigation) {
  const { navigation } = props;

  const [environment, setEnvironment] = useState("");
  const [navbarOffset, setNavbarOffset] = useState<number>(0);
  const { setToken, user, setUser } = useAuth();

  useEffect(() => {
    fetchEnvironment().then((fetchedEnvironment: string) => {
      setEnvironment(fetchedEnvironment);
    });
  }, []);

  useEffect(() => {
    const navbar = document.getElementById("tol-navbar");
    if (navbar) {
      setNavbarOffset(navbar.offsetHeight);
    }
  }, []);

  const revokeOicd = (token: string) => {
    fetch(env.API_PATH + "/auth/logout", {
      body: JSON.stringify({ token: token }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  };

  const logout = () => {
    setReturnUrlFromLocalStorage(window.location.pathname);
    const token = getTokenFromLocalStorage();
    if (token) revokeOicd(token);
    setTokenToLocalStorage("");
    setUserToLocalStorage(null);
    setToken("");
    setUser(null);
  };

  return (
    <div className="tol-navigation">
      <div className="tol-navbar-offset" style={{ height: navbarOffset }}></div>
      <Navbar
        id="tol-navbar"
        className={
          "navbar-dark " + getNavBackgroundClass(environment) + " tol-navbar"
        }
        expand="lg"
      >
        <Container>
          <Navbar.Brand
            href="/"
            style={{ padding: typeof props.brand === "string" ? 10 : 0 }}
          >
            {props.brand}
            {environment && environment !== "production" && " " + environment}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {collectNavigationItems(navigation)}
            {props.register && tokenHasExpired() ? (
              <Nav.Link className="nav-right" key="Register">
                <Login
                  buttonIcon={RegisterIcon}
                  returnUrl={props.customCallbackUrl ?? "/"}
                />
              </Nav.Link>
            ) : null}
            {props.login && tokenHasExpired() ? (
              <Nav.Link
                className={!props.register ? "nav-right" : ""}
                key="Login"
              >
                {/* @ts-ignore */}
                <Login
                  buttonIcon={LoginIcon}
                  returnUrl={getReturnUrlFromLocalStorage()}
                />
              </Nav.Link>
            ) : props.login && user && (
              <div className="nav-right">
                {/* <ProfileDropdown
                  user={user}
                  pages={props.profileNavigation
                    ?.map((page: Page) => {
                      const authorised = confirmAuthorised(
                        user,
                        page.auth,
                        page.removeOnAuth,
                      );
                      if (authorised) return page;
                      return undefined;
                    })
                    .filter((page): page is Page => page !== undefined)}
                  onLogout={logout}
                /> */}
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

//@ts-ignore
export default withRouter(Navigation);
