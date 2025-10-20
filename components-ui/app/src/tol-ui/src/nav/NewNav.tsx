/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Sidenav, Nav } from 'rsuite';
import { useState, useEffect, ReactNode } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import {
  useAuth,
  getReturnUrlFromLocalStorage,
  setReturnUrlFromLocalStorage,
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  tokenHasExpired,
  Login,
  Dropdown,
  Page,
  convertToPath,
  confirmAuthorised,
  LoginIcon,
  RegisterIcon,
  ProfileDropdown,
  fetchEnvironment,
  getBackgroundClass,
  revokeOicd,
  isProduction,
  Icon
} from "..";


export interface PNewNav extends RouteComponentProps {
  brand: ReactNode;
  pages: (Page | Dropdown)[];
  profilePages?: Page[];
  login: boolean;
  register: boolean;
  customCallbackUrl?: string;
}

export function NewNav(props: PNewNav) {
  const { brand, pages, profilePages, login, register, customCallbackUrl } = props;
  const { setToken, user, setUser } = useAuth();
  const [environment, setEnvironment] = useState("");
  const [navbarOffset, setNavbarOffset] = useState<number>(0);

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

  const logout = () => {
    setReturnUrlFromLocalStorage(window.location.pathname);
    const token = getTokenFromLocalStorage();
    if (token) revokeOicd(token);
    setTokenToLocalStorage("");
    setUserToLocalStorage(null);
    setToken("");
    setUser(null);
  };

  const addPage = (page: Page) => {
    if (!page.hidden) {
      const authorised = confirmAuthorised(user, page.auth, page.removeOnAuth);
      if (authorised) {
        return (
          <Nav.Link
            key={page.name}
            href={"link" in page ? page.link?.href : convertToPath(page.name)}
            target={page.link?.target}
          >
            {page.name}
          </Nav.Link>
        );
      }
    }
  };

  return (
    <div className="tol-side-nav">
      <Sidenav appearance="inverse">
        <Sidenav.Header className="tol-side-nav-header">
          {brand}
        </Sidenav.Header>
        <Sidenav.Body className="tol-side-nav-body">
          <Nav>
            <Nav.Item className="tol-side-nav-item">
              <Icon icon="dashboard" />
              Dashboard
            </Nav.Item>
            <Nav.Item className="tol-side-nav-item">
              <Icon icon="user" />
              User Group
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );

  const addDropdown = (dropdown: Dropdown) => {
    if (!dropdown.hidden) {
      const dropdownAuthorised = confirmAuthorised(
        user,
        dropdown.auth,
        dropdown.removeOnAuth,
      );
      if (dropdownAuthorised) {
        return (
          <NavDropdown title={dropdown.name}>
            {dropdown.pages &&
              Array.isArray(dropdown.pages) &&
              dropdown.pages.map((page: Page, index) => {
                const pageAuthorised = confirmAuthorised(
                  user,
                  page.auth,
                  page.removeOnAuth,
                );
                if (pageAuthorised) {
                  return (
                    // eslint-disable-next-line
                    <div className="nav-dropdown-box" key={index}>
                      <Nav.Link
                        key={page.name}
                        href={
                          "link" in page
                            ? page.link?.href
                            : convertToPath(page.name)
                        }
                        target={page.link?.target}
                      >
                        {page.name}
                      </Nav.Link>
                    </div>
                  );
                }
              })}
          </NavDropdown>
        );
      }
    }
  };

  return (
    <div className="navigation">
      <div style={{ height: navbarOffset }}></div>
      <Navbar
        id="tol-navbar"
        className={
          "navbar-dark " + getBackgroundClass(environment) + " tol-navbar"
        }
        expand="lg"
      >
        <Container>
          <Navbar.Brand
            href="/"
            style={{ padding: typeof props.brand === "string" ? 10 : 0 }}
          >
            {props.brand}
            {environment && !isProduction(environment) && " " + environment}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {props.pages.map((page, index) => {
              // @ts-ignore
              if (page.pages !== undefined) {
                return <span key={index}>{addDropdown(page)}</span>;
              } else {
                return <span key={index}>{addPage(page)}</span>;
              }
            })}
            {props.register && tokenHasExpired() ? (
              <Nav.Link className="nav-right" key="Register">
                {/* @ts-ignore */}
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
            ) : user ? (
              <div className="nav-right">
                <ProfileDropdown
                  user={user}
                  pages={props.profilePages
                    ?.map((page: Page) => {
                      const authorised = confirmAuthorised(
                        user,
                        page.auth,
                        page.removeOnAuth,
                      );
                      if (authorised) {
                        return page;
                      }
                      return undefined;
                    })
                    .filter((page): page is Page => page !== undefined)}
                  onLogout={logout}
                />
              </div>
            ) : null}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

//@ts-ignore
export default withRouter(NewNav);
