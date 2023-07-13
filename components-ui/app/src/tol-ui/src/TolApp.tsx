/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Navigation, Callback } from "./general/index";
import { getTokenFromLocalStorage,
  getUserFromLocalStorage, 
  tokenHasExpired} from './services/localStorage/localStorageService';
import { AuthProvider } from './contexts/auth.context';
import { Redirect } from 'react-router-dom';
import Footer from './general/Footer'
import Page from "./models/Page";
import { convertToPath } from "./general/Utils";
import { env } from './variables/config'


export interface Props {
  brand: string | JSX.Element,
  homePage: JSX.Element,
  pages: Page[],
  login?: boolean
}

function TolApp(props: Props) {
  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  // show login button as default
  let login = props.login
  if (login === undefined) {
    login = true
  }

  if (!("API_PATH" in env)) {
    return (
      <div>
        <h3>Please add 'API_PATH' as an environment variable (e.g. API_PATH=/api/v1).</h3>
      </div>
    )
  }

  return (
    <div>
      <AuthProvider
        value={{
          token,
          setToken,
          user,
          setUser,
        }}
      >
        <Router>
          <Navigation
            brand={props.brand}
            pages={props.pages}
            login={login}
          />
          <div className="tol-app">
            <Switch>
              <Route path="/" exact component={() => props.homePage} />
              <Route path="/callback" exact><Callback /></Route>
              {props.pages.map(page => {
                let path = convertToPath(page.name)
                if(page.authRequired) {
                  return <Route path={"/" + path} key={page.name} exact>{(token && !tokenHasExpired(token)) ? page.uiElement : <Redirect to="/" />}</Route>
                } else {
                  return <Route path={"/" + path} key={page.name} exact>{page.uiElement}</Route>
                }
              })}
            </Switch>
          </div>
          <Footer />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default TolApp;