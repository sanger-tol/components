/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { withRouter, RouteComponentProps, useHistory } from "react-router-dom";
import {
  useAuth,
  setReturnUrlFromLocalStorage,
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  PSmartApp,
  fetchEnvironment,
  TNavConfig,
  API_PATHS,
  IMobileNavConfig,
  NavBar,
} from "..";


export interface PNavigation extends PSmartApp, RouteComponentProps {
  /**
  * The main navigation configuration.
  */
  navigation: TNavConfig;
  /**
   * The profile navigation configuration. Can only add pages, not dropdowns.
   */
  profileNavigation: TNavConfig;
  /**
   * Mobile navigation configuration, uses standard nav bar if not set.
  */
  mobileNavConfig?: IMobileNavConfig;
}

/**
 * The Navigation component renders the navigation bar for the application.
 * It includes brand display, navigation items, and login functionality.
 */
function Navigation(props: PNavigation) {
  const {
    navigation,
    profileNavigation,
    mobileNavConfig,
    brand,
    register,
    login,
    customCallbackUrl,
  } = props;

  const history = useHistory();

  const [environment, setEnvironment] = useState("");
  const [navbarOffset, setNavbarOffset] = useState<number>(0);

  const { setToken, user, setUser } = useAuth();

  useEffect(() => {
    fetchEnvironment().then((fetchedEnvironment: string) => {
      setEnvironment(fetchedEnvironment);
    });
  }, []);

  useEffect(() => {
    const navbar = document.getElementById("tol-navbar");
    if (navbar) {
      setNavbarOffset(navbar.offsetHeight);
      document.documentElement.style.setProperty("--tol-navbar-height", navbar.offsetHeight + "px");
    }
  }, []);

  // Fade the navbar backing to black while scrolling on header pages.
  useEffect(() => {
    const navbar = document.getElementById("tol-navbar");
    if (!navbar) return;
    const onScroll = () => {
      const progress = Math.min(window.scrollY / 100, 1);
      navbar.style.setProperty("--tol-navbar-scroll", progress.toString());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const revokeOicd = (token: string) => {
    fetch(API_PATHS.API_PATH + "/auth/logout", {
      body: JSON.stringify({ token: token }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  };

  const onLogout = () => {
    setReturnUrlFromLocalStorage(window.location.pathname);
    const token = getTokenFromLocalStorage();
    if (token) revokeOicd(token);
    setTokenToLocalStorage("");
    setUserToLocalStorage(null);
    setToken("");
    setUser(null);
    history.push("/");
  };

  // Hides the navigation bar for specific pages if specified in the navigation configuration.
  const currentPath = history.location.pathname;
  const hideNavFor = navigation.hideNavFor ?? [];
  if (hideNavFor.includes(currentPath)) {
    return null;
  }

  return (
    <NavBar
      brand={brand}
      environment={environment}
      navbarOffset={navbarOffset}
      navigation={navigation}
      profileNavigation={profileNavigation}
      register={register}
      login={login}
      customCallbackUrl={customCallbackUrl}
      user={user}
      onLogout={onLogout}
      mobileNavConfig={mobileNavConfig}
    />
  );
}

//@ts-ignore
export default withRouter(Navigation);
