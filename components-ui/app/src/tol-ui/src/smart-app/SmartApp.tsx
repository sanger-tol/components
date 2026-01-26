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
import Navigation from "../nav/Navigation";
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
  const { login = true, register = false, customCallbackUrl, uiPath } = props;

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

  // Always merge system + incoming navigation (destructuring defaults only apply when props.navigation is undefined)
  const navigation: TNavConfig = {
    data: {
      ...systemNavConfig.data,
      ...(props.navigation?.data ?? {}),
    },
    order: [...systemNavConfig.order, ...(props.navigation?.order ?? [])],
  };

  // Always merge default page elements + incoming (incoming overrides defaults)
  const pageElements: TPageElements = {
    boardDetail: boards ? (
      <BoardPrivilegeContextProvider>
        <Board {...boards} />
      </BoardPrivilegeContextProvider>
    ) : null,
    validationResultsDetail: <ValidationResultsViewer />,
    callback: <Callback />,
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

  /**
   * Recursively collect all <Route /> nodes from the nav tree (pages and dropdowns at any level).
   * Returns a flat list suitable for rendering inside <Switch>.
   */
  const collectRoutes = (
    collection: TNavConfig,
    parentTrail: string[] = [],
  ) => {
    return Object.entries(collection.data).flatMap(([navKey, navItem]) => {
      const trail = [...parentTrail, navKey];
      const routeKey = trail.join(" > ");

      const routes = [
        Route({
          ...mergedProps,
          ...navItem,
          boards: boards!,
          navigation,
          pageElements,
          key: navKey,
          routeKey, // unique react key for across nesting
        }),
      ];

      // Recurse into dropdown children
      if (navItem && typeof navItem === "object" && "pages" in navItem && navItem.pages) {
        routes.push(...collectRoutes(navItem.pages, trail));
      }

      return routes;
    });
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
            <div className="tol-smart-app">
              <Navigation {...mergedProps} />
              <Switch>
                {collectRoutes(navigation)}
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