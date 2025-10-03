/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
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
  env,
  confirmAuthorised,
  LoginIcon,
  RegisterIcon,
  ProfileDropdown,
} from "..";


interface Props extends RouteComponentProps {
  brand: string | JSX.Element;
  pages: (Page | Dropdown)[];
  profilePages?: Page[];
  login: boolean;
  register: boolean;
  customCallbackUrl?: string;
  uiPath?: string;
}

interface Environment {
  environment?: string;
}

const assumeProduction = (): string => {
  console.warn("Error fetching environment. Assuming production.");
  return "production";
};

const fetchEnvironment = (): Promise<string> => {
  return fetch(env.API_PATH + "/system/environment")
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<Environment>;
      }
      return null;
    })
    .then((res: Environment | null) => {
      if (!res?.environment) {
        return assumeProduction();
      }
      return res.environment;
    })
    .catch(() => {
      return assumeProduction();
    });
};

const getBackgroundClass = (environment: string): string => {
  if (environment.startsWith("review")) return "bg-danger";
  switch (environment) {
    case "dev":
    case "testing":
    case "qa":
      return "bg-danger";
    case "staging":
      return "bg-success";
    default:
      return "";
  }
};

// on page change update returnUrl to page route
function Navigation(props: Props) {
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

  const isProduction = () => {
    return environment === "production";
  };

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

  const addPage = (page: Page) => {
    if (!page.hidden) {
      const authorised = confirmAuthorised(user, page.auth, page.removeOnAuth);
      if (authorised) {
        return (
          <Nav.Link
            key={page.name}
            href={"link" in page ? page.link?.href : convertToPath(page.name, props.uiPath)}
            target={page.link?.target}
          >
            {page.name}
          </Nav.Link>
        );
      }
    }
  };

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
                          : convertToPath(page.name, props.uiPath)
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
    <div className="tol-navigation">
      <div className="tol-navbar-offset" style={{ height: navbarOffset }}></div>
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
            style={{padding: typeof props.brand === "string" ? 10 : 0}}
          >
            {props.brand}
            {environment && !isProduction() && " " + environment}
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
export default withRouter(Navigation);
