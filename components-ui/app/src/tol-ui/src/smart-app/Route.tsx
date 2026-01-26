/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Route as ReactRoute } from "react-router-dom";
import { Board, convertToPath, IPage, PBoard, PSmartApp, useAuth } from "..";

export interface PRoute extends PSmartApp, IPage {
  /**
   * A unique key for the page which acts as the display name in the navigation.
   */
  key: string;
  /**
   * Optional unique key for React rendering.
   * Useful for nested nav trees where `key` can repeat.
   */
  routeKey?: string;
  /**
   * Parameters for board pages
   */
  boards: PBoard;
  //TODO: nesting
}

export function Route(props: PRoute) {
  const { key, routeKey, boards, path, pageElements } = props;
  //const { user } = useAuth();

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

  // Generate a route path with the key as a fallback
  const route = (
    path && 'route' in path ? path.route : undefined
  ) ?? convertToPath(key);

  return (
    <ReactRoute
      exact
      key={routeKey ?? key}
      path={route}
      render={() => element}
    />
  );
}