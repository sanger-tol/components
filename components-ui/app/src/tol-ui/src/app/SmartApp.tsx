/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// This no check will need to be removed at some point
// It is in to prevent build errors to do with the Dropdown type
// not containing detail and element props

import { useState, useEffect } from "react";
import {
  Route as ReactRouter,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Navigation from "./Navigation";
import {
  Callback,
  PageNotFound,
  getTokenFromLocalStorage,
  getUserFromLocalStorage,
  AuthProvider,
  Footer,
  matomoAnalytics,
  env,
  Board,
  ValidationResultsViewer,
  BoardPrivilegeContextProvider,
  clearUnusedLocalStorage,
  PBoard,
  TNavBrand,
  TNavConfig,
  TPageElements,
  setupBoards,
  systemDefaultNavConfig,
  collectRoutes,
  setupNavigationConfig,
  profileDefaultNavConfig,
  MyBoards,
  mergeNavConfigs,
  TsDataSource,
} from "..";

export interface PSmartApp {
  /**
   * The web_app id to fetch the nav configs.
   * This includes navigation and profile navigation configs.
   */
  id: string;
  /**
   * The datasource for configuring the app.
   */
  configDataSource?: TsDataSource;
  /**
   * The brand to display in the navigation bar.
   */
  brand: TNavBrand;
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
   * Its DataSource can be overidden by passing dataSource to SmartApp.
   */
  boards?: boolean;
  /**
   * An optional custom callback URL for authentication.
   */
  customCallbackUrl?: string;
  /**
   * An optional prefix for routing.
   */
  routePrefix?: string;
}

/**
 * Root application component that composes routing, navigation, and default page elements.
 */
export function SmartApp(props: PSmartApp) {
  const { login = true, register = false } = props;

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  const queryClient = new QueryClient();

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);
    clearUnusedLocalStorage();
  }, []);

  // Setting a default for the boardDataSource else boards will be off
  const boards = setupBoards(props.boards);

  // Merge system navigation config and add defaults
  const navigation: TNavConfig = setupNavigationConfig(props.navigation, systemDefaultNavConfig, user);

  // Merge system navigation config and add defaults
  const profileNavigation: TNavConfig = setupNavigationConfig(props.profileNavigation, profileDefaultNavConfig, user);

  // Merging configs to collect all the routes
  const mergedNavigation: TNavConfig = mergeNavConfigs(navigation, profileNavigation);

  // Always merge default page elements + incoming (incoming overrides defaults)
  const pageElements: TPageElements = {
    boardDetail: boards ? (
      <BoardPrivilegeContextProvider>
        <Board {...boards} />
      </BoardPrivilegeContextProvider>
    ) : null,
    myBoards: boards ? <MyBoards {...boards} /> : null,
    validationResultsDetail: <ValidationResultsViewer />,
    callback: <Callback />,
    ...(props.pageElements ?? {}),
  };

  // Merged props object to pass downstream so consumers see the merged values
  const mergedProps: PSmartApp = {
    ...props,
    boards,
    navigation,
    profileNavigation,
    pageElements,
    login,
    register,
  };

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
            <Navigation {...mergedProps} />
            <div className="tol-smart-app">
              <div className="tol-smart-app-content">
                <Switch>
                  {collectRoutes(
                    mergedNavigation,
                    pageElements,
                    boards
                  )}
                  <ReactRouter
                    path={`/page-not-found`}
                    component={() => <PageNotFound />}
                  />
                  <ReactRouter path="*">
                    <Redirect to={`/page-not-found`} />
                  </ReactRouter>
                </Switch>
              </div>
            </div>
            <Footer />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}
