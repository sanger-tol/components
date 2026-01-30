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
  IPageLink,
  IPageElement,
  TPageElements,
  INavDropdown,
  Route,
  INavDestination
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
  const source: TNavConfig = navigation ?? { data: {}, order: [] };

  // Build a fresh config so we can add only accessible pages with defaults
  const result: TNavConfig = { data: {}, order: [] };

  for (const navName of Object.keys(source.data)) {
    const originalNavItem = source.data?.[navName];

    // Skip if no nav item or not accessible to this user
    if (!originalNavItem || typeof originalNavItem !== "object") continue;
    if (!isPageAccessible(user, originalNavItem)) continue;

    const navItem = deepCopy(originalNavItem);

    // If it has a pageElementReference but no route, add a default
    if (navItem.path && "pageElementReference" in navItem.path) {
      navItem.path.route =
        ("route" in navItem.path ? navItem.path.route : undefined) ??
        convertToPath(navName);
    }

    // Recurse into dropdown children (do not build routes from dropdown names)
    if ("pages" in navItem && navItem.pages) {
      navItem.pages = normaliseNavConfig(navItem.pages, user);
    }

    // Add to result and only add to order if it was in source order (thus not hidden on nav)
    result.data[navName] = navItem;
    if (source.order.includes(navName)) {
      result.order.push(navName);
    }
  }

  return result;
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
 * Type guard that checks whether a value is a non-null object containing a non-empty `route` string.
 *
 * @param path - The value to validate.
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
 */
export function isDropdown(value: unknown): value is INavDropdown {
  return (
    !!value &&
    typeof value === "object" &&
    "pages" in value
  );
}

/**
 * Resolves a navigation destination object from a route or link type.
 *
 * @param path - A value expected to be either a route object or a link object.
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
 * @returns An array of React nodes representing navigation links and dropdowns in the configured order.
 */
export function collectNavigationItems(navigation: TNavConfig | undefined, user: User | null): ReactNode[] {
  const navButtons: ReactNode[] = [];

  navigation?.order.map((navItemName: string) => {
    const navItem = navigation.data[navItemName];

    // Dropdown menu
    if (isDropdown(navItem)) {
      navButtons.push(
        <NavDropdown title={navItemName}>
          {collectNavigationItems(navItem.pages, user)}
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
 * Builds a flat list of React Router route nodes from a nested navigation configuration.
 *
 * @param navigation - Navigation configuration tree to traverse.
 * @param pageElements - Mapping/registry of page elements used to render routes.
 * @param boards - Optional board configuration passed through to `Route`.
 * @param parentTrail - Accumulated navigation keys representing the current traversal path.
 * @returns A flattened array of `React.ReactNode` route elements for all valid routes in the tree.
 */
export const collectRoutes = (
  navigation: TNavConfig,
  pageElements: TPageElements,
  boards?: PBoard,
  parentTrail: string[] = [],
): React.ReactNode[] => {
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
          boards,
        }),
      );
    }

    // Recurse into dropdown children
    if (isDropdown(navItem)) {
      routes.push(
        ...collectRoutes(navItem.pages, pageElements, boards, trail),
      );
    }

    return routes;
  });
};
