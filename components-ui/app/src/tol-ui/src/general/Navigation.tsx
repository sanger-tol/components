/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { withRouter, useHistory, RouteComponentProps } from "react-router-dom";
import { Container, Navbar, Nav } from 'react-bootstrap';
import { useAuth } from '../contexts/auth.context';
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  tokenHasExpired
} from '../services/localStorage/localStorageService';
import Login from './Login';
import Page from "../models/Page";
import { convertToPath, falseIfUndefined } from "./Utils";
import { env } from '../variables/config';


interface NavProps extends RouteComponentProps {
  brand: string | JSX.Element,
  pages: Page[],
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

function Navigation(props: NavProps) {
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
            <Nav className="ml-auto">
              {props.pages.map(page => { // eslint-disable-next-line
                const pageName = page.name
                const path = convertToPath(pageName);
                const authRequired = falseIfUndefined(page.authRequired);
                const adminOnly = falseIfUndefined(page.adminOnly);
                const hidden = falseIfUndefined(page.hidden);

                if (!hidden) {
                  if(authRequired && adminOnly && token && !tokenHasExpired() && user && user.roles && user.roles.some(role => role.role === "admin")) {
                    return <Nav.Link className="nav-link" href={"/" + path} key={pageName}>{pageName}</Nav.Link>;
                  } else if(authRequired && !adminOnly && token && !tokenHasExpired()) {
                    return <Nav.Link className="nav-link" href={"/" + path} key={pageName}>{pageName}</Nav.Link>;
                  } else if(!authRequired) {
                    return <Nav.Link className="nav-link" href={"/" + path} key={pageName}>{pageName}</Nav.Link>;
                  }
                }
              })}
              {(!token || tokenHasExpired()) && props.login &&
                <Nav.Link className="nav-link" key="Login">
                  <Login/>
                </Nav.Link>
              }
              {token && !tokenHasExpired() && props.login &&
                <Nav.Link onClick={logout} className="nav-link" href="/" key="Logout">
                  Logout
                </Nav.Link>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default withRouter(Navigation);