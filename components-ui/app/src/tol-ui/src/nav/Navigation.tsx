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
import Dropdown from "../models/Nav";
import Page from "../models/Nav";
import { convertToPath, falseIfUndefined } from "../general/Utils";
import { env } from '../variables/config';


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

  const logout = function() {
    const token = getTokenFromLocalStorage();
    if (token) revokeOicd(token);
    setTokenToLocalStorage('');
    setUserToLocalStorage(null);
    setToken('');
    setUser(null);
    history.replace("/");
  };

  function checkAuth(authRequired: boolean, adminOnly: boolean, user: any, token: any){
    if(authRequired && adminOnly && token && !tokenHasExpired() && user /*&& isAdmin*/) {
      return true;
    } else if(authRequired && !adminOnly && token && !tokenHasExpired()) {
      return true;
    } else if(!authRequired) {
      return true;
    }
  }

  function addPage(page: Page, isDropdown?: boolean){
    const pageName = page.name;
    const path = convertToPath(pageName);
    const authRequired = falseIfUndefined(page.auth);
    const adminOnly = falseIfUndefined(page.admin);
    const hidden = falseIfUndefined(page.hidden);
    if (!hidden || isDropdown) {
      const authorized = checkAuth(authRequired, adminOnly, user, token);
      if (authorized) {
        return <Nav.Link key={pageName} href={"/" + path}>{pageName}</Nav.Link>;
      }
    }
  }

  function addDropdown(dropdown: Dropdown){
    const dropdownAuthRequired = falseIfUndefined(dropdown.auth);
    const dropdownAdminOnly = falseIfUndefined(dropdown.admin);
    const dropdownHidden = falseIfUndefined(dropdown.hidden);
    if (dropdown.pages && !dropdownHidden){
      const authorized = checkAuth(dropdownAuthRequired, dropdownAdminOnly, user, token);
      if(authorized) {
        return (
          <NavDropdown title={dropdown.name}>
            {dropdown.pages.map((page: Page, index) => {
              return (// eslint-disable-next-line
                <div className="nav-dropdown-box" key={index}>
                  {addPage(page, true)}
                </div>
              );
            })}
          </NavDropdown>
        );
      }
    }
  }

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
