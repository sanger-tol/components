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
  BoardContextProvider,
  clearUnusedLocalStorage,
  TNavBrand,
  TNavConfig,
  TPageElements,
  getSystemDefaultNavConfig,
  collectRoutes,
  getProfileDefaultNavConfig,
  MyBoards,
  mergeNavConfigs,
  TsDataSource,
  TDataObjectOrNull,
  PopUpMessage,
  WEB_APP,
  LoadingContent,
  CORE_CONFIG_DS,
  mergeAndNormaliseNavConfig,
  GlobalLoadingProvider,
  ACTIONS_DS,
  URL_PATHS,
  UserProfile,
  IUserProfileAdditionalConfigs,
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
   * The datasource for fetching actions.
   */
  actionsDataSource?: TsDataSource;
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
  /**
   * If false, removes the footer from the application.
   */
  footer?: boolean;
  /**
   * Optional configuration for the user profile form, including base and additional configs.
   * If not provided, the default configuration will be used.
   */
  profileFormConfigs?: {
    baseConfig?: any;
    additionalConfigs?: IUserProfileAdditionalConfigs;
  };
}

/**
 * Root application component that composes routing, navigation, and default page elements.
 */
export function SmartApp(props: PSmartApp) {
  const {
    id,
    configDataSource = CORE_CONFIG_DS,
    actionsDataSource = ACTIONS_DS,
    brand,
    login = true,
    register = false,
    configurableBoards = false,
    routePrefix,
    footer = true,
    profileFormConfigs,
  } = props;

  const [token, setToken] = useState(getTokenFromLocalStorage);
  const [user, setUser] = useState(getUserFromLocalStorage);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [fetchedNavigation, setFetchedNavigation] = useState<TNavConfig>();
  const [fetchedProfileNavigation, setFetchedProfileNavigation] =
    useState<TNavConfig>();

  const [queryClient] = useState(() => new QueryClient());

  // Combines the system defaults and incoming config
  const defaultNavigation = mergeNavConfigs(
    props.navigation,
    getSystemDefaultNavConfig(configurableBoards),
  );
  const defaultProfileNavigation = mergeNavConfigs(
    props.profileNavigation,
    getProfileDefaultNavConfig(configurableBoards),
  );

  useEffect(() => {
    const siteId = env.MATOMO_SITE_ID;
    matomoAnalytics(siteId);
    clearUnusedLocalStorage();
  }, []);

  useEffect(() => {
    // If no id provided, skip fetching and just use local config
    if (!id) {
      setTimeout(() => setGlobalLoading(false), 100);
      return;
    }

    configDataSource
      .getOne({
        objectType: WEB_APP,
        id,
      })
      .then((obj: TDataObjectOrNull) => {
        setFetchedNavigation(obj?.navigation);
        setFetchedProfileNavigation(obj?.profile_navigation);

        // If nav not found the object will be null
        if (!obj) {
          throw Error(`No configuration found for web app with id: ${id}`);
        }
      })
      .catch((error) => {
        console.error(error);
        PopUpMessage({
          type: "warning",
          message:
            "Failed to fetch navigation configuration. Only using defaults.",
        });
      })
      .finally(() => {
        // Small delay as loading screen can feel abrupt if it disappears immediately
        setTimeout(() => setGlobalLoading(false), 300);
      });
  }, [configDataSource, id]);

  const navigation = mergeAndNormaliseNavConfig(
    fetchedNavigation,
    defaultNavigation,
    user,
    routePrefix,
  );
  const profileNavigation = mergeAndNormaliseNavConfig(
    fetchedProfileNavigation,
    defaultProfileNavigation,
    user,
    routePrefix,
  );

  const routeNavigation = mergeAndNormaliseNavConfig(
    fetchedNavigation,
    defaultNavigation,
    user,
    routePrefix,
    false,
  );
  const routeProfileNavigation = mergeAndNormaliseNavConfig(
    fetchedProfileNavigation,
    defaultProfileNavigation,
    user,
    routePrefix,
    false,
  );

  // Merging configs to collect all the routes
  const mergedNavigation: TNavConfig = mergeNavConfigs(
    routeNavigation,
    routeProfileNavigation,
  );

  // Always merge default page elements + incoming (incoming overrides defaults)
  const pageElements: TPageElements = {
    boardDetail: (
      <BoardContextProvider>
        <Board
          boardDataSource={configDataSource}
          actionsDataSource={actionsDataSource}
        />
      </BoardContextProvider>
    ),
    myBoards: (
      <MyBoards
        boardDataSource={configDataSource}
        actionsDataSource={actionsDataSource}
      />
    ),
    validationResultsDetail: <ValidationResultsViewer />,
    profile: <UserProfile {...profileFormConfigs} />,
    callback: <Callback {...props} />,
    ...(props.pageElements ?? {}),
  };

  // Merged props object to pass downstream so consumers see the merged values
  const navProps = {
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
      className={!globalLoading ? "is-fading-out" : ""}
    />
  );

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
          <GlobalLoadingProvider
            value={{
              globalLoading,
              setGlobalLoading,
            }}
          >
            <Router>
              <div className="tol-board-backing-fade" />
              <Navigation {...navProps} />
              <div className="tol-smart-app">
                <div className="tol-smart-app-content">
                  {/* Switch also needs loading screen to ensure smooth transition */}
                  {LoadingScreen}
                  {!globalLoading && (
                    <>
                      <Switch>
                        {collectRoutes(
                          mergedNavigation,
                          pageElements,
                          configDataSource,
                          actionsDataSource,
                        )}
                        <ReactRouter
                          path={URL_PATHS.PAGE_NOT_FOUND}
                          component={() => <PageNotFound />}
                        />
                        <ReactRouter path="*">
                          <Redirect to={URL_PATHS.PAGE_NOT_FOUND} />
                        </ReactRouter>
                      </Switch>
                    </>
                  )}
                </div>
              </div>
              {footer && <Footer />}
            </Router>
          </GlobalLoadingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}
