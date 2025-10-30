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
  BoardPrivilegeContextProvider,
  clearUnusedLocalStorage
} from "..";


export interface BoardSources {
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
  uiPath?: string;
}


export function TolApp(props: Props) {
  const { customCallbackUrl, uiPath } = props;

  // ensure redirect targets are absolute; basePath will be '/' or '/<uiPath>/'
  const basePath = uiPath ? `/${uiPath}/` : "/";

  // setting a default for the boardDataSource
  const boards = props.boards ? {
    boardDataSource: props.boards?.boardDataSource
      || new TsDataSource({
        apiPath: env.API_PATH,
        apiDataPath: "boards"  // Not being passed in?
      }),
  } : undefined;
  const queryClient = new QueryClient();

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);

    clearUnusedLocalStorage();
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
            uiPath={uiPath}
            pages={props.pages}
            profilePages={profilePages}
            login={login}
            register={register}
            customCallbackUrl={customCallbackUrl}
          />
          <div className="tol-app">
            <Switch>
              <Route
                path={[`${basePath}`,]}
                exact
                render={() => props.homePage}
              />
              <Route path={`${basePath}callback`} exact>
                <Callback />
              </Route>
              <Route path={`${basePath}board/:boardId`}>
                {boards && loggedIn ? (
                  <BoardPrivilegeContextProvider>
                    <Board
                      dataSource={boards.dataSource}
                      boardDataSource={boards.boardDataSource}
                    />
                  </BoardPrivilegeContextProvider>
                ) : (
                  <Redirect to={basePath} replace />
                )}
              </Route>
              <Route path={`${basePath}file-validation/results/:uploadId`} render={(routeProps) => {
                return loggedIn ? (
                  <ValidationResultsViewer {...routeProps} />
                ) : (
                  <Redirect to={basePath} replace />
                )
              }} />
              {allPageRoutes.map((page) => {
                const path = convertToPath(page.name, uiPath);
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
                      convertToPath(dropdownPage.name, uiPath);
                    // dropdown page route
                    routes.push(
                      <Route exact path={dropdownPath} key={dropdownPage.name}>
                        {authorised ? (
                          getElementDependingOnAuthStatus(loggedIn, dropdownPage)
                        ) : (
                          <Redirect to={`${uiPath ?? ''}/`} replace />
                        )}
                      </Route>,
                    );

                    // dropdown detail page route
                    if (dropdownPage.detail) {
                      routes.push(
                        <Route
                          exact
                          path={`${dropdownPath}/:id`}
                          key={`${page.name}-detail`}
                        >
                          {!dropdownPage.detailAuth || (dropdownPage.detailAuth && user?.id) ? (
                            dropdownPage.detail
                          ) : (
                            <Redirect to={`${uiPath ?? ''}/`} replace />
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
                        <Redirect to={basePath} replace />
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
                          {!page.detailAuth || (page.detailAuth && user) ? page.detail : <Redirect to={basePath} replace />}
                        </Route>,
                      );
                    }
                }
                return routes;
              })}
              <Route
                path={`/page-not-found`}
                component={() => <PageNotFound />}
              />
              <Route path="*">
                <Redirect to={`/page-not-found`} />
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
