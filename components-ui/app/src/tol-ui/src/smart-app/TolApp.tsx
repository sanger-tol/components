/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// This no check will need to be removed at some point
// It is in to prevent build errors to do with the Dropdown type
// not containing detail and element props
// @ts-nocheck

import { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Navigation from "../nav/Navigation";
import {
  Callback,
  PageNotFound,
  getTokenFromLocalStorage,
  getUserFromLocalStorage,
  tokenHasExpired,
  confirmAuthorised,
  getElementDependingOnAuthStatus,
  AuthProvider,
  Footer,
  Dropdown,
  Page,
  convertToPath,
  matomoAnalytics,
  env,
  Board,
  addBoardPages,
  generatePagesThatRequireARoute,
  TsDataSource,
  API_METHODS,
  BOARDS_API_PREFIX,
  ValidationResultsViewer,
  getUserPrivilege,
  PrivilegeContext,
  BoardPrivilegeContextProvider
} from "..";


export interface BoardSources {
  dataSource: TsDataSource;
  boardDataSource?: TsDataSource;
}

interface Props {
  brand: string | JSX.Element;
  homePage: JSX.Element;
  pages: (Page | Dropdown)[];
  profilePages?: Page[];
  login?: boolean;
  boards?: BoardSources;
  register?: boolean;
  customCallbackUrl?: string;
}


export function TolApp(props: Props) {
  const { customCallbackUrl } = props;

  // setting a default for the boardDataSource
  const boards = props.boards ? {
    dataSource: props.boards?.dataSource,
    boardDataSource: props.boards?.boardDataSource
      || new TsDataSource({
        apiPrefix: BOARDS_API_PREFIX,
      }),
  } : undefined;
  const queryClient = new QueryClient();

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);
  }, []);

  // show login button as default
  const login = props.login ?? true;

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

  const profilePages = addBoardPages(props.profilePages, boards);
  const allPageRoutes = generatePagesThatRequireARoute(props.pages, profilePages);
  const loggedIn = user && !tokenHasExpired();

  return (
    <div id="tol-app-background">
      <QueryClientProvider client={queryClient}>
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
            profilePages={profilePages}
            login={login}
            register={register}
            customCallbackUrl={customCallbackUrl}
          />
          <div className="tol-app">
            <Switch>
              <Route path="/" exact component={() => props.homePage} />
              <Route path="/callback" exact>
                <Callback />
              </Route>
              <Route path="/board/:boardId">
                {boards && loggedIn ? (
                  <BoardPrivilegeContextProvider>
                    <Board
                      dataSource={boards.dataSource}
                      boardDataSource={boards.boardDataSource}
                    />
                  </BoardPrivilegeContextProvider>
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route path="/file-validation/results/:uploadId" render={(routeProps) => {
                return loggedIn ? (
                  <ValidationResultsViewer {...routeProps} />
                ) : (
                  <Redirect to="/" />
                )
              }} />
              {allPageRoutes.map((page) => {
                const path = convertToPath(page.name);
                const routes = [];
                const authorised = confirmAuthorised(
                  user,
                  page.auth,
                  page.removeOnAuth,
                );

                // dropdown routes
                if ('pages' in page && page.pages) {
                  page.pages.forEach((dropdownPage: Page) => {
                    const individualPageAuthorised = confirmAuthorised(
                      user,
                      dropdownPage.auth,
                      dropdownPage.removeOnAuth,
                    );
                    const dropdownPath =
                      convertToPath(dropdownPage.name);
                    // dropdown page route
                    routes.push(
                      <Route exact path={dropdownPath} key={dropdownPath}>
                        {individualPageAuthorised ? (
                          getElementDependingOnAuthStatus(
                            loggedIn,
                            dropdownPage,
                          )
                        ) : (
                          <Redirect to="/" />
                        )}
                      </Route>,
                    );

                    // dropdown detail page route
                    if (dropdownPage.detail) {
                      routes.push(
                        <Route
                          exact
                          path={`${dropdownPath}/:id`}
                          key={`${dropdownPath}-detail`}
                        >
                          {!dropdownPage.detailAuth || (dropdownPage.detailAuth && user) ? (
                            dropdownPage.detail
                          ) : (
                            <Redirect to="/" />
                          )}
                        </Route>,
                      );
                    }
                  });
                } else {
                  // regular page route
                  routes.push(
                    <Route exact path={path} key={page.name}>
                      {authorised ? (
                        getElementDependingOnAuthStatus(loggedIn, page)
                      ) : (
                        <Redirect to="/" />
                      )}
                    </Route>,
                  );

                  // detail page route
                  if ('detail' in page && page.detail) {
                    routes.push(
                      <Route
                        exact
                        path={`${path}/:id`}
                        key={`${page.name}-detail`}
                      >
                        {!dropdownPage.detailAuth || (dropdownPage.detailAuth && user) ? page.detail : <Redirect to="/" />}
                      </Route>,
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
      </QueryClientProvider>
    </div>
  );
}
