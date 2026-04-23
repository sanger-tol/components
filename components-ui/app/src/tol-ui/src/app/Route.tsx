/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Route as ReactRoute } from "react-router-dom";
import { Board, IPageElement, TNavBrand, TPageElements, TsDataSource } from "..";

export interface PRoute {
  /**
   * Unique key for React rendering.
   */
  routeKey: string;
  /**
   * Includes the route and pageElementReference.
   */
  path: IPageElement;
  /**
  * A React node mapping for page element references.
  */
  pageElements?: TPageElements;
  /**
  * Parameters for board pages.
  */
  boardDataSource?: TsDataSource;
  /**
   * The data source for fetching actions.
   */
  actionsDataSource?: TsDataSource;
  /**
   * The brand to display in the loading screen.
   */
  brand?: TNavBrand;
}

/**
 * Route component that will directly ouput a React Router Route with the correct
 * component based on the path's pageElementReference.
 */
export function Route(props: PRoute) {
  const { routeKey, boardDataSource, actionsDataSource, path, pageElements, brand } = props;

  let element: React.ReactNode;

  // Check if there is a pageElementReference in the path
  if (path && "pageElementReference" in path && path.pageElementReference) {
    // If a dev page is defined prioritise that
    if (pageElements && path.pageElementReference in pageElements) {
      element = pageElements[path.pageElementReference];
      // If not, assume it's a boardId and render a Board component
    } else if (boardDataSource) {
      element = (
        <Board
          boardDataSource={boardDataSource}
          boardId={path.pageElementReference}
          brand={brand}
          actionsDataSource={actionsDataSource!}
        />
      );
    }
  }

  return (
    <ReactRoute
      exact
      key={routeKey}
      path={path.route}
      render={() => element}
    />
  );
}
