/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import {
  PBoard,
  TsDataSource,
  BOARDS,
  TDataObjectOrNull,
  PRIVILEGE,
  env,
  BOARDS_API_DATA_PATH,
  TNavConfig,
  systemNavConfig,
  convertToPath,
  TPageOrDropdown,
  PAGE_ACCESS,
  User,
  deepCopy,
} from "..";


export const assumeProduction = (): string => {
  console.warn("Error fetching environment. Assuming production.");
  return "production";
};

export const fetchEnvironment = (): Promise<string> => {
  return fetch(env.API_PATH + "/system/environment")
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

export async function getUserPrivilege(
  user: any,
  boardDataSource: TsDataSource,
  boardId: string
) {
  if (user && boardDataSource && boardId) {
    return boardDataSource.getOne({
      objectType: BOARDS.BOARD,
      id: boardId,
    }).then(async (board: TDataObjectOrNull) => {
      const boardUser = await board?.relationships?.user;
      if (board && (boardUser?.id?.toString() === user?.id?.toString() || user?.roles?.includes('admin'))) {
        return PRIVILEGE.BOARD.EDITABLE;
      } else {
        return PRIVILEGE.BOARD.VIEWABLE;
      }
    });
  } else {
    // If no user or boardDataSource, return hidden
    return PRIVILEGE.BOARD.HIDDEN;
  }
}

/**
 * Deletes cache stored in localStorage more than the set age limit.
 * This age limit is defined at the top of this function.
 * 
 * This function is designed to be called in `TolApp` as it mounts
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
 * Sets up board configuration for the 'SmartApp'.
 * 
 * @param boards - Optional board configuration. Can be either:
 *   - A boolean value: if `true`, creates a default board with a new TsDataSource
 *   - A PBoard object: returns the object as-is
 *   - undefined/false: returns undefined
 * 
 * @returns A PBoard object with configured data source, the provided PBoard object, 
 *          or undefined if boards is falsy.
 */
export function setupBoards(boards?: PBoard | boolean): PBoard | undefined {
  if (boards) {
    if (typeof boards === 'boolean') {
      return {
        boardDataSource: new TsDataSource({
          apiPath: env.API_PATH,
          apiDataPath: BOARDS_API_DATA_PATH,
        }),
      };
    } else {
      return boards;
    }
  }
  return undefined;
}

/**
 * Adds missing default values to a navigation configuration recursively.
 * 
 * @param navigation - The navigation config to normalize. If `undefined`, a default empty config is used.
 * @param user - The current user object; used to determine page accessibility.
 * 
 * @returns A new navigation config with defaults applied and pruned inaccessible pages.
 */
export function normaliseNavConfig(navigation: TNavConfig | undefined, user: User | null): TNavConfig {
  const nav: TNavConfig = navigation ?? { data: {}, order: [] };

  for (const [navName, originalNavItem] of Object.entries(nav.data ?? {})) {
    if (
      !isPageAccessible(user, originalNavItem) ||
      (!originalNavItem || typeof originalNavItem !== "object")
    ) continue;

    nav.data[navName] = deepCopy(originalNavItem);
    nav.order.push(navName);

    const navItem = Object.values(nav.data)[navName];

    console.log(navItem, nav);

    // If it has a pageElementReference but no route, add a default
    if (navItem.path && 'pageElementReference' in navItem.path) {

      // Generate a route path with the key as a fallback
      navItem.path.route = (
        navItem.path && 'route' in navItem.path ? navItem.path.route : undefined
      ) ?? convertToPath(navName);
    }

    // Recurse into dropdown children (do not build routes from dropdown names)
    if ("pages" in navItem && navItem.pages) {
      navItem.pages = normaliseNavConfig(navItem.pages, user);
    }
  }

  return nav;
}

/**
 * Builds a complete navigation configuration by merging the provided partial config
 * with the system defaults and then applying any additional defaulting/normalization.
 *
 * @param navigation - Optional, partial navigation configuration to merge with system defaults.
 * 
 * @returns A finalized {@link TNavConfig} with defaults applied via `normaliseNavConfigForUser`.
 */
export function setupNavigationConfig(navigation: TNavConfig | undefined, user: User | null): TNavConfig {
  // Combine system nav config with incoming config
  navigation = {
    data: {
      ...systemNavConfig.data,
      ...(navigation?.data ?? {}),
    },
    order: [...systemNavConfig.order, ...(navigation?.order ?? [])]
  }
  return normaliseNavConfig(navigation, user);
}

/**
 * Recursively collects an ordered list of React navigation elements from a navigation configuration.
 * Iterates over `navigation.order` to maintain the specified order of items and to control what can be seen in the nav.
 *
 * @param navigation - Navigation configuration to render. If `undefined`, returns an empty array.
 * @returns An array of React nodes representing navigation links and dropdowns in the configured order.
 */
export function collectNavigationItems(navigation: TNavConfig | undefined, user: User | null): ReactNode[] {
  const navButtons: ReactNode[] = [];

  navigation?.order.map((navItemName: string) => {
    const navItem = navigation.data[navItemName];

    if (!isPageAccessible(user, navItem)) return;

    // Dropdown menu
    if ("pages" in navItem) {
      navButtons.push(
        <NavDropdown title={navItemName}>
          {collectNavigationItems(navItem.pages, user)}
        </NavDropdown>
      )
      // Single page link
    } else {
      // Alter depending on whether it's a route or an external link
      let href = "";
      let target = "";
      if (navItem.path) {
        if ("route" in navItem.path && navItem.path.route) {
          href = navItem.path.route;
        } else if ('href' in navItem.path && navItem.path.href) {
          href = navItem.path.href;
          target = navItem.path.target ?? "_blank";
        }
      }

      navButtons.push(
        <Nav.Link
          key={navItemName}
          href={href}
          target={target}
        >
          {navItemName}
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
 * @returns `true` if the user is allowed to access the page; otherwise `false`.
 */
export function isPageAccessible(user: User | null, page: TPageOrDropdown): boolean {
  // If no auth required, allow access
  if (!page.access || page.access === PAGE_ACCESS.PUBLIC) return true;

  // If user not logged in, deny access
  if (!user) return false;

  // If page requires login, allow access
  if (page.access === PAGE_ACCESS.AUTHENTICATED) return true;

  // If page requires specific roles, check user roles
  if (Array.isArray(page.access)) {
    return page.access.some((requiredRole) =>
      user.roles?.includes(requiredRole)
    );
  }

  // Default deny
  return false;
}
