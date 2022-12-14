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
import convertToPath from "./general/Utils";
import { api_version } from './general/Env'

import 'bootstrap/dist/css/bootstrap.min.css';
import '../../src/scss/tol-styling.scss';


export interface AppProps {
  brand: string | JSX.Element,
  home_page: JSX.Element,
  pages: Page[]
}

function TolApp(props: AppProps) {
  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  if (api_version === undefined) {
    return (
      <div>
        <h3>Please add 'REACT_APP_API_VERSION' as an environment variable (e.g. REACT_APP_API_VERSION=1).</h3>
      </div>
    )
  }

  return (
    <div className="App">
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
          />
          <Switch>
            <Route path="/" exact component={() => props.home_page} />
            <Route path="/callback" exact><Callback /></Route>
            {props.pages.map(page => {
              let path = convertToPath(page.name)
              if(page.auth_required) {
                return <Route path={"/" + path} key={page.name} exact>{(token && !tokenHasExpired(token)) ? page.ui_element : <Redirect to="/" />}</Route>
              } else {
                return <Route path={"/" + path} key={page.name} exact>{page.ui_element}</Route>
              }
            })}
          </Switch>
          <Footer />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default TolApp;