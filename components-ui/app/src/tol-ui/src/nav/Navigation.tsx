/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { withRouter, useHistory, RouteComponentProps } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/auth.context';
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  tokenHasExpired
} from '../services/localStorage/localStorageService';
import Login from './Login';
import { Dropdown } from "../models/Nav";
import { Page } from "../models/Nav";
import { convertToPath } from "../general/Utils";
import { env } from '../variables/config';
import { confirmAuthorised } from '../services/auth/authService';


interface Props extends RouteComponentProps {
  brand: string | JSX.Element,
  pages: (Page | Dropdown)[],
  login: boolean
}

interface Environment {
  environment: string | undefined;
}

const assumeProduction = (): string => {
  console.warn("Error fetching environment. Assuming production.");
  return "production";
};

const fetchEnvironment = (): Promise<string> => {
  return fetch(env.API_PATH + '/system/environment')
    .then(res => {
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
  switch (environment) {
  case "dev":
    return "bg-warning";
  case "testing":
    return "bg-info";
  case "staging":
    return "bg-success";
  case "qa":
    return "bg-secondary";
  }
  return "";
};

function Navigation(props: Props) {
  const { token, setToken, user, setUser } = useAuth();
  const history = useHistory();
  const [environment, setEnvironment] = useState("");
  useEffect(() => {
    fetchEnvironment()
      .then((fetchedEnvironment: string) => {
        setEnvironment(fetchedEnvironment);
      });
  }, []);

  const isProduction = () => {
    return environment === "production";
  };

  const revokeOicd = (token: string) => {
    fetch(
      env.API_PATH + '/auth/logout', {
        body: JSON.stringify({token: token}),
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      }
    );
  };

  const logout = () => {
    const token = getTokenFromLocalStorage();
    if (token) revokeOicd(token);
    setTokenToLocalStorage('');
    setUserToLocalStorage(null);
    setToken('');
    setUser(null);
    history.replace("/");
  };

  const addPage = (page: Page) => {
    if (!page.hidden) {
      const authorised = confirmAuthorised(user, page.auth);
      if (authorised) {
        return (
          <Nav.Link key={page.name} href={convertToPath(page.name)}>
            {page.name}
          </Nav.Link>
        );
      }
    }
  };

  const addDropdown = (dropdown: Dropdown) => {
    if (!dropdown.hidden){
      const authorised = confirmAuthorised(user, dropdown.auth);
      if (authorised) {
        return (
          <NavDropdown title={dropdown.name}>
            {dropdown.pages && dropdown.pages.map((page: Page, index) => {
              return ( // eslint-disable-next-line
                <div className="nav-dropdown-box" key={index}>
                  <Nav.Link
                    key={page.name}
                    href={
                      convertToPath(dropdown.name)
                      + convertToPath(page.name)
                    }
                  >
                    {page.name}
                  </Nav.Link>
                </div>
              );
            })}
          </NavDropdown>
        );
      }
    }
  };

  return (
    <div className="navigation">
      <Navbar
        className={
          (isProduction() && environment ?
            "navbar-dark" :
            "navbar-light " + getBackgroundClass(environment))
          + " navbar-custom fixed-top"
        }
        expand="lg"
      >
        <Container>
          <Navbar.Brand href="/">
            {props.brand}
            {environment && !isProduction() &&
              " " + environment
            }
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {props.pages.map((page, index) => {
              // @ts-ignore
              if (page.pages !== undefined){
                return (
                  <span key={index}>
                    {addDropdown(page)}
                  </span>
                );
              } else {
                return (
                  <span key={index}>
                    {addPage(page)}
                  </span>
                );
              }
            })}
            {(!token || tokenHasExpired()) && props.login &&
              <Nav.Link className="nav-right" key="Login">
                <Login/>
              </Nav.Link>
            }
            {token && !tokenHasExpired() && props.login &&
              <Nav.Link onClick={logout} className="nav-right" href="/" key="Logout">
                Logout
              </Nav.Link>
            }
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default withRouter(Navigation);
