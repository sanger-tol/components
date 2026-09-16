/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Route as ReactRoute } from "react-router-dom";
import {
  Board,
  BoardContextProvider,
  IFilter,
  IPageElement,
  RequireAuth,
  RequireCompletedProfile,
  RequireRole,
  TPageAccess,
  TPageElements,
  TsDataSource,
  accessRequiresAuth,
  accessRequiresRole,
  resolveTemplateValues,
} from "..";


/** Props for rendering a configured React Router route. */
export interface PRoute {
  /** Unique key for React rendering. */
  routeKey: string;
  /** Route and page element reference configuration. */
  path: IPageElement;
  /** React node mapping for page element references. */
  pageElements?: TPageElements;
  /** Data source for board pages. */
  boardDataSource?: TsDataSource;
  /** Data source for fetching actions. */
  actionsDataSource?: TsDataSource;
  /**
   * The access level for this route. Drives the runtime guard chain: non-public
   * access wraps the page in auth + completed-profile guards, and role-gated
   * access additionally wraps it in a role guard.
   */
  access?: TPageAccess;
}

/** Renders a React Router route for a page element or board reference. */
export function Route(props: PRoute) {
  const {
    routeKey,
    boardDataSource,
    actionsDataSource,
    path,
    pageElements,
    access,
  } = props;

  /** Resolves route parameters and renders the configured page element. */
  const renderElement = (routeParams: Record<string, string>): React.ReactNode => {
    let element: React.ReactNode;

    // Check if there is a pageElementReference in the path
    if (path && "pageElementReference" in path && path.pageElementReference) {
      // If a dev page is defined prioritise that
      if (pageElements && path.pageElementReference in pageElements) {
        element = pageElements[path.pageElementReference];
        // If not, assume it's a boardId and render a Board component
      } else if (boardDataSource) {
        const queryParams = path.queryParams
          ? resolveTemplateValues(path.queryParams, routeParams)
          : undefined;
        const objectType = queryParams?.objectType as string;
        const filter = queryParams?.filter as IFilter;
        element = (
          <BoardContextProvider>
            <Board
              boardDataSource={boardDataSource}
              boardId={path.pageElementReference}
              actionsDataSource={actionsDataSource!}
              object_type={objectType}
              filter={filter}
            />
          </BoardContextProvider>
        );
      }
    }

    // If the route requires auth, wrap the page in the auth and profile guards
    if (accessRequiresAuth(access)) {
      const guarded = accessRequiresRole(access) ? (
        <RequireRole access={access!}>{element}</RequireRole>
      ) : (
        element
      );

      element = (
        <RequireAuth>
          <RequireCompletedProfile>{guarded}</RequireCompletedProfile>
        </RequireAuth>
      );
    }

    return element;
  };

  return (
    <ReactRoute
      exact
      key={routeKey}
      path={path.route}
      render={(routeProps) => renderElement(routeProps.match.params)}
    />
  );
}
