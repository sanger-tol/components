/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  TsDataSource,
  PRIVILEGE,
  TBoardPrivilege,
  TNavConfig,
  TPageOrDropdown,
  TPageAccess,
  PAGE_ACCESS,
  IUser,
  deepCopy,
  IPageLink,
  IPageElement,
  TPageElements,
  INavDropdown,
  Route,
  INavDestination,
  formatPath,
  API_PATHS,
  IMobileOptions,
} from "..";


export const assumeProduction = (): string => {
  console.warn("Error fetching environment. Assuming production.");
  return "production";
};

export const fetchEnvironment = (): Promise<string> => {
  return fetch(API_PATHS.API_PATH + "/system/environment")
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<any>;
      }
      return null;
    })
    .then((res: any) => {
      if (!res?.environment) {
        return assumeProduction();
      }
      return res.environment;
    })
    .catch(() => {
      return assumeProduction();
    });
};

export const getNavBackgroundClass = (environment: string): string => {
  if (environment.startsWith("review")) return "bg-danger";
  switch (environment) {
    case "dev":
    case "testing":
    case "qa":
      return "bg-danger";
    case "staging":
      return "bg-success";
    default:
      return "";
  }
};

// When we add private boards, we can also check this to determine whether
// the board is viewable or not
export function getUserPrivilege(
  writePrivilege: boolean,
): TBoardPrivilege {
  return writePrivilege ? PRIVILEGE.BOARD.WRITABLE : PRIVILEGE.BOARD.VIEWABLE as TBoardPrivilege;
}

/**
 * Deletes cache stored in localStorage more than the set age limit.
 * This age limit is defined at the top of this function.
 * 
 * This function is designed to be called in `SmartApp` as it mounts
 */
export function clearUnusedLocalStorage() {
  // The number of hours old a key must be before it is deleted
  const hoursAgeLimit = 1;

  // The prefixes of keys we're checking which may be cleared
  const prefixesOfKeysToClear = [
    "/_config/attribute_metadata-",
    "/_config/relationships-",
    "entityMeta-",
  ];

  // You can't iterate over localStorage, but you can get how many keys it has with `.length`
  // combined with `key(index)`, so we need to use a count-controlled loop, decrementing i
  // each time we remove a key
  for (let i = 0; i < localStorage.length; i++) {
    // Get storage key
    const storageKey = localStorage.key(i);

    // Check if this is one of the keys we're looking for
    // (by skipping ones that aren't)
    if (!(storageKey && prefixesOfKeysToClear.some(prefix => storageKey.includes(prefix)))) {
      continue;
    }

    // Retrieve value
    const valueString = localStorage.getItem(storageKey);
    if (!valueString) continue;

    // Parse value to object and use it to get expiry date of this value
    const value: { expiry: string, data: object } = JSON.parse(valueString);
    const expiryDate = new Date(value.expiry);

    // Calculate the difference in hours between now and the expiry date
    const age = Date.now() - expiryDate.getTime();
    const hoursPassed = new Date(age).getHours();

    // Delete this key if the time difference exceeds the limit
    if (hoursPassed >= hoursAgeLimit) {
      localStorage.removeItem(storageKey);

      // We need to adjust the index one back after removing an item
      i--;
    }
  }
}

/**
 * Generates a route path string for a page element.
 *
 * @param displayName - Human-readable name used to derive a route when `path` is not given.
 * @param path - Optional page element that may provide an explicit route.
 * @param routePrefix - Optional prefix to prepend to the generated route.
 * 
 * @returns The generated route path string.
 */
export function generateRoutePath(
  displayName: string,
  path?: IPageElement | undefined,
  routePrefix: string = "",
): string {
  const mainRoute: string = isRoute(path) ? path.route! : formatPath(displayName);
  return routePrefix ? `/${routePrefix}${mainRoute}` : mainRoute;
}

/**
 * Resolves the routes for navigation items that should hide the navigation bar.
 *
 * @param hideNavFor - Navigation item names whose routes should hide the navigation bar.
 * @param navigation - Navigation configuration containing the resolved navigation items.
 *
 * @returns An array of routes that should hide the navigation bar.
 */
export function getHideNavForRoutes(
  hideNavFor: string[] | undefined,
  navigation: TNavConfig,
): string[] {
  return hideNavFor
    ?.map((id) => {
      if (!Object.prototype.hasOwnProperty.call(navigation.data, id)) return undefined;
      if (isRoute(navigation.data[id].path)) return navigation.data[id].path.route;

      // Accounts for if path isn't set in the config
      return generateRoutePath(id);
    })
    .filter((route): route is string => route !== undefined) ?? [];
}

/**
 * Adds missing default values to a navigation configuration recursively.
 * 
 * @param navigation - The navigation config to normalize. If `undefined`, a default empty config is used.
 * @param user - The current user object; used to determine page accessibility.
 * @param routePrefix - An optional prefix to prepend to all routes.
 * 
 * @returns A new navigation config with defaults applied and pruned inaccessible pages.
 */
export function normaliseNavConfig(
  navigation: TNavConfig | undefined,
  user: IUser | null,
  routePrefix: string = "",
  filterByAccess: boolean = true,
): TNavConfig {
  const source: TNavConfig = navigation ?? { data: {}, order: [] };

  // Build a fresh config so we can add only accessible pages with defaults
  const result: TNavConfig = { data: {}, order: [] };

  for (const displayName of Object.keys(source.data)) {
    const originalNavItem = source.data?.[displayName];

    // Skip if no nav item, or (when filtering) not accessible to this user.
    // Route generation passes `filterByAccess = false` so every defined page
    // still gets a route and can run the runtime auth/profile/role guards,
    // rather than being pruned and falling through to page-not-found.
    if (!originalNavItem || typeof originalNavItem !== "object") continue;
    if (filterByAccess && !isPageAccessible(user, originalNavItem)) continue;

    const navItem: TPageOrDropdown = deepCopy(originalNavItem);

    // If it has a pageElementReference but no route, add a default
    if (isPageElementReference(navItem.path)) {
      navItem.path.route = generateRoutePath(displayName, navItem.path, routePrefix);
    }

    // Recurse into dropdown children (do not build routes from dropdown names)
    if (isDropdown(navItem)) {
      navItem.pages = normaliseNavConfig(navItem.pages, user, routePrefix, filterByAccess);
    }

    // Add to result
    result.data[displayName] = navItem;
  }

  // Maintain the order specified in the source config, but filter out any items that were not added to result
  result.order = source.order.filter(
    (id) => Object.prototype.hasOwnProperty.call(result.data, id)
  );

  if (source.hideNavFor) {
    result.hideNavFor = getHideNavForRoutes(source.hideNavFor, result);
  }

  return result;
}

/**
 * Shallow merges two navigation configuration objects into a single configuration.
 * 
 * @param baseConfig - The base navigation configuration to start from.
 * @param additionalConfig - The navigation configuration to merge into the base.
 * 
 * @returns A new {@link TNavConfig} containing the merged `data` and concatenated `order`.
 */
export function mergeNavConfigs(
  baseConfig: TNavConfig | undefined,
  additionalConfig: TNavConfig | undefined,
): TNavConfig {
  const mergedConfig: TNavConfig = {
    data: {
      ...baseConfig?.data,
      ...additionalConfig?.data,
    },
    order: [...baseConfig?.order ?? [], ...additionalConfig?.order ?? []],
    hideNavFor: [...(baseConfig?.hideNavFor ?? []), ...(additionalConfig?.hideNavFor ?? [])],
  };
  return mergedConfig;
}

/**
 * Builds a complete navigation configuration by merging the provided partial config
 * with the system defaults and then applying any additional defaulting/normalization.
 *
 * @param navigation - Optional, partial navigation configuration to merge with system defaults.
 * @param defaultNavigation - The default navigation configuration to merge with.
 * @param user - The current user object; used to determine page accessibility.
 * @param routePrefix - An optional prefix to prepend to all routes.
 * 
 * @returns A finalized {@link TNavConfig} with defaults applied via `normaliseNavConfigForUser`.
 */
export function mergeAndNormaliseNavConfig(
  navigation: TNavConfig | undefined,
  defaultNavigation: TNavConfig,
  user: IUser | null,
  routePrefix: string = "",
  filterByAccess: boolean = true,
): TNavConfig {
  // Combine system nav config with incoming config
  const combinedNavConfig = mergeNavConfigs(navigation, defaultNavigation);
  return normaliseNavConfig(combinedNavConfig, user, routePrefix, filterByAccess);
}

/**
 * Type guard that checks whether a value is a non-null object containing a non-empty `route` string.
 *
 * @param path - The value to validate.
 * 
 * @returns `true` if `path` is an object with a non-empty string `route` property; otherwise `false`.
 */
export function isRoute(path: unknown): path is IPageElement {
  return (
    !!path &&
    typeof path === "object" &&
    "route" in path &&
    typeof (path as any).route === "string" &&
    (path as any).route.length > 0
  );
}

/**
 * Type guard that checks whether a value is a non-null object containing a non-empty `href` string.
 *
 * @param path - The value to validate.
 * 
 * @returns `true` if `path` is an object with a non-empty string `href` property; otherwise `false`.
 */
export function isLink(path: unknown): path is IPageLink {
  return (
    !!path &&
    typeof path === "object" &&
    "href" in path &&
    typeof (path as any).href === "string" &&
    (path as any).href.length > 0
  );
}

/**
 * Type guard: checks whether a value is a non-null object containing a `pages` nav config.
 * 
 * @param value - The value to validate.
 * 
 * @returns `true` if `value` is an object with a `pages` property; otherwise `false`.
 */
export function isDropdown(value: unknown): value is INavDropdown {
  return (
    !!value &&
    typeof value === "object" &&
    "pages" in value
  );
}

/**
 * Type guard that checks whether a value is a non-null object containing a non-empty
 * `pageElementReference` string.
 *
 * @param path - The value to validate.
 *
 * @returns `true` if `path` is an object with a non-empty string `pageElementReference` property;
 * otherwise `false`.
 */
export function isPageElementReference(path: unknown): path is IPageElement {
  return (
    !!path &&
    typeof path === "object" &&
    "pageElementReference" in path &&
    typeof (path as any).pageElementReference === "string" &&
    (path as any).pageElementReference.length > 0
  );
}

/**
 * Resolves a navigation destination object from a route or link type.
 *
 * @param path - A value expected to be either a route object or a link object.
 * 
 * @returns An {@link INavDestination} containing the resolved `destination` and optional `target`.
 */
export function getNavDestination(path: unknown): INavDestination {
  if (isRoute(path)) return { destination: path.route! };
  if (isLink(path)) return { destination: path.href, target: path.target ?? "_blank" };
  return { destination: "" };
}

/**
 * Recursively collects an ordered list of React navigation elements from a navigation configuration.
 * Iterates over `navigation.order` to maintain the specified order of items and to control what can be seen in the nav.
 *
 * @param navigation - Navigation configuration to render. If `undefined`, returns an empty array.
 * @param mobileOptions - Mobile navbar options. Optional.
 * 
 * @returns An array of React nodes representing navigation links and dropdowns in the configured order.
 */
export function collectNavigationItems(
  navigation: TNavConfig | undefined,
  mobileOptions?: IMobileOptions
): ReactNode[] {
  const navButtons: ReactNode[] = [];
  navigation?.order.map((navItemName: string) => {
    const navItem = navigation.data[navItemName];

    // Dropdown menu
    if (isDropdown(navItem)) {
      navButtons.push(
        <NavDropdown
          key={navItemName}
          title={navItem.icon ? <FontAwesomeIcon icon={navItem.icon} size='2x' /> : navItemName}
        >
          {collectNavigationItems(navItem.pages, mobileOptions)}
        </NavDropdown>
      )
      // Single page nav item
    } else {
      const { destination, target } = getNavDestination(navItem.path);

      navButtons.push(
        <Nav.Link
          key={navItemName}
          href={destination}
          target={target}
        >
          {/*@ts-ignore*/}
          {navItem.icon ? <FontAwesomeIcon icon={navItem.icon} size='2x' /> : navItemName}
        </Nav.Link>
      )
    }
  });

  return navButtons;
};

/**
 * Determines whether a given page is accessible to the provided user based on the page's access rules.
 * 
 * @param user - The current user object; if falsy, the user is treated as not logged in. Expected to contain a `roles` array.
 * @param page - The page or dropdown definition containing an `access` field that specifies the access policy.
 * 
 * @returns `true` if the user is allowed to access the page; otherwise `false`.
 */
export function isPageAccessible(user: IUser | null, page: TPageOrDropdown): boolean {
  // If no auth required, allow access
  if (!page.access || page.access === PAGE_ACCESS.PUBLIC) return true;

  // If user not logged in, deny access
  if (!user?.id) return false;

  // If page requires login, allow access
  if (page.access === PAGE_ACCESS.AUTHENTICATED) return true;

  // If page requires a role and user has a role, allow access
  if (page.access === PAGE_ACCESS.ROLE_REQUIRED && user.roles.length > 0) return true;

  // If page requires specific roles, check user roles
  if (Array.isArray(page.access)) {
    return page.access.some((requiredRole) =>
      user.roles?.includes(requiredRole)
    );
  }

  // Default deny
  return false;
}

/**
 * Determines whether a given page requires authentication and profile access.
 * If a page is not public, it is assumed to require authentication and profile access.
 * 
 * @param page - The page or dropdown definition containing an `access` field that specifies the access policy.
 * @returns `true` if the page requires authentication and profile access; otherwise `false`.
 */
export function pageRequiresAuthAndProfile(page: TPageOrDropdown): boolean {
  return accessRequiresAuth(page.access);
}

/**
 * Determines whether an access level requires an authenticated user.
 *
 * Any access level other than public (i.e. `authenticated`, `role_required`, or
 * a list of roles) implies a logged-in user, and so gets the runtime auth and
 * profile guards.
 *
 * @param access - The page's access level.
 * @returns `true` if the access level requires authentication; otherwise `false`.
 */
export function accessRequiresAuth(access: TPageAccess | undefined): boolean {
  return !!access && access !== PAGE_ACCESS.PUBLIC;
}

/**
 * Determines whether an access level gates on roles, i.e. it requires either
 * any role (`role_required`) or one of a specific set of roles (a role array).
 *
 * @param access - The page's access level.
 * @returns `true` if the access level is role-gated; otherwise `false`.
 */
export function accessRequiresRole(access: TPageAccess | undefined): boolean {
  return access === PAGE_ACCESS.ROLE_REQUIRED || Array.isArray(access);
}

/**
 * Determines whether a user satisfies a role-based access level.
 *
 * Mirrors the role checks in {@link isPageAccessible}: `role_required` is met by
 * any role, a role array is met by holding at least one of the listed roles, and
 * non-role access levels have nothing to enforce.
 *
 * @param user - The current user; expected to contain a `roles` array.
 * @param access - The page's access level.
 * @returns `true` if the user meets the role requirement; otherwise `false`.
 */
export function userMeetsRoleRequirement(
  user: IUser | null,
  access: TPageAccess | undefined,
): boolean {
  if (access === PAGE_ACCESS.ROLE_REQUIRED) return (user?.roles?.length ?? 0) > 0;
  if (Array.isArray(access)) return access.some((role) => user?.roles?.includes(role));
  return true;
}

/**
 * Builds a flat list of React Router route nodes from a nested navigation configuration.
 *
 * @param navigation - Navigation configuration tree to traverse.
 * @param pageElements - Mapping/registry of page elements used to render routes.
 * @param boardDataSource - Optional data source for board pages, passed to `Route` for rendering.
 * @param actionsDataSource - Optional data source for fetching actions.
 * @param parentTrail - Accumulated navigation keys representing the current traversal path.
 * 
 * @returns A flattened array of `React.ReactNode` route elements for all valid routes in the tree.
 */
export function collectRoutes(
  navigation: TNavConfig,
  pageElements: TPageElements,
  boardDataSource?: TsDataSource,
  actionsDataSource?: TsDataSource,
  parentTrail: string[] = [],
): React.ReactNode[] {
  return Object.entries(navigation.data).flatMap(([navKey, navItem]) => {
    const trail = [...parentTrail, navKey];
    const routeKey = trail.join(" > ");

    const routes: React.ReactNode[] = [];

    // Add a route for this item if it has one
    if (isRoute(navItem.path)) {
      routes.push(
        Route({
          routeKey,
          path: navItem.path,
          pageElements,
          boardDataSource,
          actionsDataSource,
          access: navItem.access,
        }),
      );
    }

    // Recurse into dropdown children
    if (isDropdown(navItem)) {
      routes.push(
        ...collectRoutes(navItem.pages, pageElements, boardDataSource, actionsDataSource, trail),
      );
    }

    return routes;
  });
};
