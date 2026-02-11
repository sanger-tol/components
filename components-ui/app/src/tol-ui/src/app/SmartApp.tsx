/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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
  getSystemDefaultNavConfig,
  collectRoutes,
  setupNavigationConfig,
  getProfileDefaultNavConfig,
  MyBoards,
  mergeNavConfigs,
  TsDataSource,
  TDataObjectOrNull,
  PopUpMessage,
  WEB_APP,
  LoadingContent,
  CORE_CONFIG_DS,
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
   * A navigation configuration.
   */
  navigation?: TNavConfig;
  /**
   * A profile navigation configuration.
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
    configDataSource = CORE_CONFIG_DS,
    brand,
    login = true,
    register = false,
    configurableBoards = false,
  } = props;

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);
  const [loading, setLoading] = useState(true);
  const [loadingFade, setLoadingFade] = useState(false);

  // Combines the system defaults and incoming config
  const defaultNavigation = setupNavigationConfig(
    props.navigation,
    getSystemDefaultNavConfig(configurableBoards),
    user
  );
  const defaultProfileNavigation = setupNavigationConfig(
    props.profileNavigation,
    getProfileDefaultNavConfig(configurableBoards),
    user
  );

  const [navigation, setNavigation] = useState<TNavConfig>(defaultNavigation);
  const [profileNavigation, setProfileNavigation] = useState<TNavConfig>(defaultProfileNavigation);

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
        setupNavigationConfig(fetchedNav, defaultNavigation, user)
      );

      // Merge profile system navigation config and add defaults
      setProfileNavigation(
        setupNavigationConfig(fetchedProfileNav, defaultProfileNavigation, user)
      );
      // If nav not found the object will be null
      if (!obj) {
        throw Error(`No configuration found for web app with id: ${id}`);
      }
    }).catch((error) => {
      console.error(error);
      PopUpMessage({
        type: "warning",
        message: "Failed to fetch navigation configuration. Only using defaults.",
      })
    }).finally(() => {
      setLoading(false);

      // Small delay as loading screen can feel abrupt if it disappears immediately
      setTimeout(() => setLoadingFade(true), 300);
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
    myBoards: <MyBoards boardDataSource={configDataSource} />,
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

  const LoadingScreen = (
    <LoadingContent
      overlayNav
      brand={brand}
      className={loadingFade ? "is-fading-out" : ""}
      text=""
    />
  )

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
                {/* Switch also needs loading screen to ensure smooth transition */}
                {LoadingScreen}
                {!loading && (
                  <>
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
                  </>
                )}
              </div>
            </div>
            <Footer />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}
