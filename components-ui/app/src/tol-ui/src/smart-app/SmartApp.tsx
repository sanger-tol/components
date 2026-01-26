/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// This no check will need to be removed at some point
// It is in to prevent build errors to do with the Dropdown type
// not containing detail and element props
// @ts-nocheck

import { useState, useEffect, createContext } from "react";
import { Route as ReactRouter, BrowserRouter as Router, Switch, Redirect } from "react-router-dom";
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
  TsDataSource,
  API_METHODS,
  BOARDS_API_DATA_PATH,
  ValidationResultsViewer,
  getUserPrivilege,
  PrivilegeContext,
  BoardPrivilegeContextProvider,
  clearUnusedLocalStorage,
  PBoard,
  TNavConfig,
  TPageElements,
  IPage,
  setupBoards,
  Route,
  systemNavConfig,
} from "..";

export interface PSmartApp {
  /**
   * The brand to display in the navigation bar.
   */
  brand: TNavBrand;
  /**
   * The main navigation configuration.
   */
  navigation?: TNavConfig;
  /**
   * The profile navigation configuration. Can only add pages, not dropdowns.
   */
  profileNavigation?: TNavConfig;
  /**
   * A React node mapping for page element references.
   */
  pageElements?: TPageElements;
  /**
   * If true, enables the login functionality.
   */
  login?: boolean;
  /**
   * If true, enables the registration functionality.
   */
  register?: boolean;
  /**
   * Configuration for user boards. If true, boards are enabled with default settings.
   * If a PBoard object is provided, it customizes the board settings.
   */
  boards?: boolean | PBoard;
  /**
   * An optional custom callback URL for authentication.
   */
  customCallbackUrl?: string;
  /**
   * An optional UI path prefix for routing.
   */
  uiPath?: string;
}

export function SmartApp(props: PSmartApp) {
  const {
    login = true,
    register = false,
    customCallbackUrl,
    uiPath,
  } = props;

  // Setting a default for the boardDataSource else boards will be off
  const boards = setupBoards(props.boards);

  // Always merge system + incoming navigation (destructuring defaults only apply when props.navigation is undefined)
  const navigation: TNavConfig = {
    data: {
      ...systemNavConfig.data,
      ...(props.navigation?.data ?? {}),
    },
    order: [
      ...systemNavConfig.order,
      ...(props.navigation?.order ?? []),
    ],
  };

  // Always merge default page elements + incoming (incoming overrides defaults)
  const pageElements: TPageElements = {
    boardDetail: (
      <BoardPrivilegeContextProvider>
        <Board {...boards} />
      </BoardPrivilegeContextProvider>
    ),
    validationResultsDetail: <ValidationResultsViewer />,
    callback: <Callback />,
    pageNotFound: <PageNotFound />,
    wildcard: <Redirect to="/page-not-found" />,
    ...(props.pageElements ?? {}),
  };

  // One merged props object to pass downstream so consumers see the merged values
  const mergedProps: PSmartApp = {
    ...props,
    boards,
    customCallbackUrl,
    login,
    navigation,
    pageElements,
    register,
    uiPath,
  };

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  const queryClient = new QueryClient();

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);
    clearUnusedLocalStorage();
  }, []);

  return (
    <div id="tol-smart-app-background">
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
            <div className="tol-smart-app">
              <Navigation {...mergedProps} />
              <Switch>
                {/* Build routes from *all* data entries (order only controls nav display) */}
                {Object.entries(navigation.data).map(([navKey, navItem]) => {
                  return Route({
                    ...mergedProps,
                    ...navItem,
                    boards,
                    navigation,
                    pageElements,
                    key: navKey,
                  });
                })}
                <ReactRouter
                  path={`/page-not-found`}
                  component={() => <PageNotFound />}
                />
                <ReactRouter path="*">
                  <Redirect to={`/page-not-found`} />
                </ReactRouter>
              </Switch>
            </div>
            <Footer />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}