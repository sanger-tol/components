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
  TNavBrand,
  TNavConfig,
  TPageElements,
  systemDefaultNavConfig,
  collectRoutes,
  setupNavigationConfig,
  profileDefaultNavConfig,
  MyBoards,
  mergeNavConfigs,
  TsDataSource,
  TDataObjectOrNull,
  PopUpMessage,
  BOARDS_API_DATA_PATH,
  WEB_APP,
  LoadingContent,
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
   * Whether boards can be configured for other apps.
   */
  configurableBoards?: boolean;
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
  const {
    id,
    configDataSource = new TsDataSource({
      apiPath: env.API_PATH,
      apiDataPath: BOARDS_API_DATA_PATH,
    }),
    login = true,
    register = false,
    configurableBoards = false,
  } = props;

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);

  const [loading, setLoading] = useState(true);

  const [navigation, setNavigation] = useState<TNavConfig>(systemDefaultNavConfig);
  const [profileNavigation, setProfileNavigation] = useState<TNavConfig>(profileDefaultNavConfig);

  const queryClient = new QueryClient();

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);
    clearUnusedLocalStorage();
  }, []);

  useEffect(() => {
    configDataSource.getOne({
      objectType: WEB_APP,
      id,
    }).then((obj: TDataObjectOrNull) => {
      const fetchedNav = obj?.navigation as TNavConfig | undefined;
      const fetchedProfileNav = obj?.profile_navigation as TNavConfig | undefined;

      // Merge system navigation config and add defaults
      setNavigation(
        setupNavigationConfig(fetchedNav, systemDefaultNavConfig, user)
      );

      // Merge system navigation config and add defaults
      setProfileNavigation(
        setupNavigationConfig(fetchedProfileNav, profileDefaultNavConfig, user)
      );
    }).catch(() => {
      PopUpMessage({
        type: "error",
        message: "Failed to fetch navigation configuration. Please try again later.",
      })
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Merging configs to collect all the routes
  const mergedNavigation: TNavConfig = mergeNavConfigs(navigation, profileNavigation);

  // Always merge default page elements + incoming (incoming overrides defaults)
  const pageElements: TPageElements = {
    boardDetail: (
      <BoardPrivilegeContextProvider>
        <Board boardDataSource={configDataSource} />
      </BoardPrivilegeContextProvider>
    ),
    myBoards: configurableBoards ? <MyBoards boardDataSource={configDataSource} /> : null,
    validationResultsDetail: <ValidationResultsViewer />,
    callback: <Callback />,
    ...(props.pageElements ?? {}),
  };

  // Merged props object to pass downstream so consumers see the merged values
  const mergedProps = {
    ...props,
    navigation,
    profileNavigation,
    pageElements,
    login,
    register,
  };

  if (loading) return <LoadingContent />;

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
                    configDataSource
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
