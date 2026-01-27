/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Route as ReactRoute } from "react-router-dom";
import { Board, IPage, isPageAccessible, PBoard, PSmartApp, User } from "..";

export interface PRoute extends PSmartApp, IPage {
  /**
   * A unique key for the page which acts as the display name in the navigation.
   */
  navKey: string;
  /**
   * Optional unique key for React rendering.
   * Useful for nested nav trees where `key` can repeat.
   */
  routeKey?: string;
  /**
   * Parameters for board pages
   */
  boards: PBoard;
  /**
   * The current user object, can't use useAuth hook here as it's treated as a pure function.
   */
  user: User | null;
}

export function Route(props: PRoute) {
  const { navKey, routeKey, boards, path, pageElements, user } = props;

  // ignore routes without a path e.g. external links
  if (!(path && 'route' in path)) return;

  // Check if user has access to the page
  if (!isPageAccessible(user, props)) return;

  let element: React.ReactNode = undefined;

  // Check if there is a pageElementReference in the path
  if (path && "pageElementReference" in path && path.pageElementReference) {
    // If a dev page is defined prioritise that
    if (pageElements && path.pageElementReference in pageElements) {
      element = pageElements[path.pageElementReference];
      // If not, assume it's a boardId and render a Board component
    } else {
      element = <Board {...boards} boardId={path.pageElementReference} />;
    }
  }

  return (
    <ReactRoute
      exact
      key={routeKey ?? navKey}
      path={path.route}
      render={() => element}
    />
  );
}
