/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { BrowserRouter as Router,
         Route,
         Switch,
         Redirect } from "react-router-dom";
import { Navigation, Callback, PageNotFound } from "./general/index";
import { getTokenFromLocalStorage,
  getUserFromLocalStorage, 
  tokenHasExpired} from './services/localStorage/localStorageService';
import { AuthProvider } from './contexts/auth.context';
import Footer from './general/Footer'
import Page from "./models/Page";
import { convertToPath, falseIfUndefined, matomoAnalytics } from "./general/Utils";
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

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID 
    matomoAnalytics(siteId)
  }, [])

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
    <div id="tol-app-background">
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

              {/* {props.pages.map(page => {
                // debugger
                let path = convertToPath(page.name)
                const authRequired = falseIfUndefined(page.authRequired)

                if (authRequired) {
                  return <Route path={"/" + path} key={page.name} exact>{(token && !tokenHasExpired(token)) ? page.uiElement : <Redirect to="/" />}</Route>
                } else {
                  return <Route path={"/" + path} key={page.name} exact>{page.uiElement}</Route>
                }
              })} */}

              {props.pages.map(page => {
                let path = convertToPath(page.name);
                const authRequired = falseIfUndefined(page.authRequired);

                // Regular page route
                const regularRoute = (
                  <Route path={`/${path}`} key={page.name} exact>
                    {authRequired ? (token && !tokenHasExpired(token)) ? page.uiElement : <Redirect to="/" />
                      : page.uiElement}
                  </Route>
                );

                // Detail page route
                const detailRoute = page.detailElement && (
                  <Route path={`/${path}/:id`} key={`${page.name}-detail`} exact>
                    {authRequired ? (token && !tokenHasExpired(token)) ? page.detailElement : <Redirect to="/" />
                      : page.detailElement}
                  </Route>
                );
              return [regularRoute, detailRoute];
              })}

              <Route path="/page-not-found" component={() => <PageNotFound/>} />
            </Switch>
          </div>
          <Footer /> 
        </Router>
      </AuthProvider>
    </div>
  );
}

export default TolApp;