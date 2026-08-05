/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { AnchorHTMLAttributes } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb } from "rsuite";
import {
  splitPath,
  generateLinkFromRequestedPath
} from "..";
import type { TBreadcrumbSize, IBreadcrumbLink, TBreadcrumbLinks } from "..";

export interface PBreadcrumbNav {
  /**
   * The links to display in the breadcrumb navigation.
   * If set to `"auto"`, the component will automatically generate links based on the current URL path.
   */
  links?: TBreadcrumbLinks;
  /**
   * The separator to use between breadcrumb items. Defaults to `"/"`.
   */
  separator?: string;
  /**
   * Whether the breadcrumb items should be clickable links. Defaults to `true`.
   */
  linkable?: boolean;
  /**
   * Whether the last breadcrumb item should be clickable. Defaults to `false`.
   */
  lastLinkable?: boolean;
  /**
   * The maximum number of breadcrumb items to display. Defaults to `5`.
   */
  maxItems?: number;
  /**
   * The size of the breadcrumb items. Can be `"sm"`, `"md"`, or `"lg"`. Defaults to `"md"`.
   */
  size?: TBreadcrumbSize;
  /**
   * Whether the breadcrumb navigation is in a loading state. Defaults to `false`, mainly used in the Remote version.
   */
  isLoading?: boolean;
}

/**
 * @autodoc
 *
 * Renders breadcrumb navigation from either an explicit link list or the current route.
 * It supports configurable separators, item sizing, loading styling, and whether
 * intermediate or final breadcrumb items should remain clickable.
 */

export function BreadcrumbNav(props: PBreadcrumbNav) {
  const {
    links = "auto",
    separator = "/",
    linkable = true,
    lastLinkable = false,
    maxItems = 5,
    size = "md",
    isLoading = false,
  } = props;

  const { pathname } = useLocation();

  const linksToRender =
    links === "auto"
      ? splitPath(pathname).map((text, index, paths) => ({
          text,
          url: generateLinkFromRequestedPath(paths.slice(0, index + 1)),
        }))
      : links;

  const BreadcrumbRouterLink = ({
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return <Link to={href ?? "/"} {...props} />;
  };

  return (
    <Breadcrumb
      separator={separator}
      maxItems={maxItems}
      className={`${size} ${isLoading ? "is-loading" : ""} ${links !== "auto" ? "not-auto-generated" : ""}`}
    >
      {linksToRender.map((link: IBreadcrumbLink, index: number) => {
        const isLast = index === linksToRender.length - 1;
        const isLinked =
          linkable && (!isLast || lastLinkable) && Boolean(link.url);

        if (isLinked) {
          return (
            <Breadcrumb.Item
              key={`${link.url}-${index}`}
              as={BreadcrumbRouterLink}
              href={link.url}
              onClick={link.onClick}
            >
              {link.text}
            </Breadcrumb.Item>
          );
        }

        return (
          <Breadcrumb.Item
            key={`${link.url ?? link.text}-${index}`}
            active={isLast}
            onClick={link.onClick}
          >
            {link.text}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}
