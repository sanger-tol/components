/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Container, Navbar, Nav } from "react-bootstrap";
import {
  getReturnUrlFromLocalStorage,
  tokenHasExpired,
  Login,
  LoginIcon,
  RegisterIcon,
  getNavBackgroundClass,
  collectNavigationItems,
  ProfileDropdown,
  TNavConfig,
  TNavBrand,
  IUser,
  IMobileNavConfig,
} from "..";

export interface PNavBar {
  /**
   * The brand to display in the navigation bar. Hidden when running in mobile mode.
   */
  brand: TNavBrand;
  /**
   * The currently detected environment, displayed alongside the brand when not production.
   */
  environment: string;
  /**
   * The height, in pixels, reserved above the page content to offset the fixed navbar.
   */
  navbarOffset: number;
  /**
   * The main navigation configuration.
   */
  navigation: TNavConfig;
  /**
   * The profile navigation configuration. Can only add pages, not dropdowns.
   */
  profileNavigation: TNavConfig;
  /**
   * If true, enables the registration functionality.
   */
  register?: boolean;
  /**
   * If true, enables the login functionality.
   */
  login?: boolean;
  /**
   * An optional custom callback URL for authentication, used by the register button.
   */
  customCallbackUrl?: string;
  /**
   * The currently authenticated user, or null if no user is logged in.
   */
  user: IUser | null;
  /**
   * Callback function to handle user logout.
   */
  onLogout: () => void;
  /**
   * Optional configuration for mobile navigation.
   */
  mobileNavConfig?: IMobileNavConfig;
}

/**
 * The NavBar component renders the navigation bar, switching between a desktop and mobile
 * layout depending on whether `mobileNavConfig` is set.
 */
export function NavBar(props: PNavBar) {
  const {
    brand,
    environment,
    navbarOffset,
    navigation,
    profileNavigation,
    register,
    login,
    customCallbackUrl,
    user,
    onLogout,
    mobileNavConfig,
  } = props;

  const isMobile = !!mobileNavConfig;
  const showRegister = register && tokenHasExpired() && (!isMobile || mobileNavConfig.register);
  const showLogin = login && tokenHasExpired() && (!isMobile || mobileNavConfig.login);
  const showProfile = login && user && (!isMobile || mobileNavConfig.profile);

  return (
    <div className={"tol-navigation" + (isMobile ? " tol-navigation-mobile" : "")}>
      <div className="tol-navbar-offset" style={{ height: navbarOffset }}></div>
      <Navbar
        id="tol-navbar"
        className={
          "navbar-dark " +
          getNavBackgroundClass(environment) +
          " tol-navbar" +
          (isMobile ? " tol-navbar-mobile" : "")
        }
        expand="lg"
      >
        <Container>
          {!isMobile && (
            <Navbar.Brand
              href="/"
              style={{ padding: typeof brand === "string" ? 10 : 0 }}
            >
              {brand}
              {environment && environment !== "production" && " " + environment}
            </Navbar.Brand>
          )}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {collectNavigationItems(navigation, mobileNavConfig)}
            {showRegister ? (
              <Nav.Link className="nav-right" key="Register">
                <Login
                  buttonIcon={RegisterIcon}
                  returnUrl={customCallbackUrl ?? "/"}
                />
              </Nav.Link>
            ) : null}
            {showLogin ? (
              <Nav.Link className={!register ? "nav-right" : ""} key="Login">
                {/* @ts-ignore */}
                <Login
                  buttonIcon={LoginIcon}
                  returnUrl={getReturnUrlFromLocalStorage()}
                />
              </Nav.Link>
            ) : showProfile && (
              <div className="nav-right">
                <ProfileDropdown
                  user={user}
                  onLogout={onLogout}
                  navigation={profileNavigation}
                />
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
