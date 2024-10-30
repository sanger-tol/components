/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// This no check will need to be removed at some point
// It is in to prevent build errors to do with the Dropdown type
// not containing detail and element props
// @ts-nocheck

import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { Navigation, Callback, PageNotFound } from "./nav";
import {
  getTokenFromLocalStorage,
  getUserFromLocalStorage,
  tokenHasExpired,
  setReturnUrlFromLocalStorage
} from "./services/localStorage/localStorageService";
import { confirmAuthorised, getElement } from "./services/auth/authService";
import { AuthProvider } from "./contexts/auth.context";
import Footer from "./general/Footer";
import { Dropdown, Page } from "./models/Nav";
import {
  convertToPath,
  matomoAnalytics
} from "./general/Utils";
import { env } from "./variables/config";


export interface Props {
  brand: string | JSX.Element;
  homePage: JSX.Element;
  pages: (Page | Dropdown)[];
  login?: boolean;
  register?: boolean;
  customCallbackUrl?: string;
}

function TolApp(props: Props) {
  const {customCallbackUrl} = props;

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  useEffect(() => {
    setReturnUrlFromLocalStorage(window.location.pathname);
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);
  }, []);

  // show login button as default
  const login = props.login || true;

  // hide register button by default
  const register = props.register || false;

  if (!("API_PATH" in env)) {
    return (
      <div>
        <h3>
          Please add &apos;API_PATH&apos; as an environment variable (e.g.
          API_PATH=/api/v1).
        </h3>
      </div>
    );
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
            register={register}
            customCallbackUrl={customCallbackUrl}
          />
          <div className="tol-app">
            <Switch>
              <Route
                path="/"
                exact
                component={() => props.homePage}
              />
              <Route
                path="/callback"
                exact
              >
                <Callback />
              </Route>
              {props.pages.map((page) => {
                const path = convertToPath(page.name);
                const routes = [];
                const loggedIn = user && !tokenHasExpired();
                const authorised = confirmAuthorised(
                  user,
                  page.auth,
                  page.removeOnAuth
                );

                // dropdown routes
                if (page.pages) {
                  page.pages.forEach((dropdownPage: Page) => {
                    const dropdownPath =
                      convertToPath(page.name) +
                      convertToPath(dropdownPage.name);

                    // dropdown page route
                    routes.push(
                      <Route
                        exact
                        path={dropdownPath}
                        key={dropdownPath}
                      >
                        {authorised ? (
                          getElement(loggedIn, dropdownPage)
                        ) : (
                          <Redirect to="/" />
                        )}
                      </Route>
                    );

                    // dropdown detail page route
                    if (dropdownPage.detail) {
                      routes.push(
                        <Route
                          exact
                          path={`${dropdownPath}/:id`}
                          key={`${dropdownPath}-detail`}
                        >
                          {authorised ? (
                            dropdownPage.detail
                          ) : (
                            <Redirect to="/" />
                          )}
                        </Route>
                      );
                    }
                  });
                } else {
                  // regular page route
                  routes.push(
                    <Route
                      exact
                      path={path}
                      key={page.name}
                    >
                      {authorised ? (
                        getElement(loggedIn, page)
                      ) : (
                        <Redirect to="/" />
                      )}
                    </Route>
                  );

                  // detail page route
                  if (page.detail) {
                    routes.push(
                      <Route
                        exact
                        path={`${path}/:id`}
                        key={`${page.name}-detail`}
                      >
                        {authorised ? page.detail : <Redirect to="/" />}
                      </Route>
                    );
                  }
                }

                return routes;
              })}
              <Route
                path="/page-not-found"
                component={() => <PageNotFound />}
              />
              <Route path="*">
                <Redirect to="/page-not-found" />
              </Route>
            </Switch>
          </div>
          <Footer />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default TolApp;
