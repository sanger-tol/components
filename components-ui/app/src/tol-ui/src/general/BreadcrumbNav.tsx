/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { AnchorHTMLAttributes } from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumb } from "rsuite";

export interface IBreadcrumbLink {
  text: string;
  url?: string;
  icon?: string;
  onClick?: () => void;
}

export type TBreadcrumbLinks = IBreadcrumbLink[] | "auto";
export type TBreadcrumbSize = "sm" | "md" | "lg";

export interface PBreadcrumbNav {
  links?: TBreadcrumbLinks;
  separator?: string;
  linkable?: boolean;
  lastLinkable?: boolean;
  maxItems?: number;
  size?: TBreadcrumbSize;
}

export function splitPath(path: string): string[] {
  const parts = path.split("/").filter((part) => part !== "");
  return parts;
}

export function generateLinkFromRequestedPath(paths: string[]): string {
  const parts = paths.join("/");
  return `/${parts}`;
}

export function BreadcrumbRouterLink({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <Link to={href ?? "/"} {...props} />;
}

export function BreadcrumbNav(props: PBreadcrumbNav) {
  const {
    links = "auto",
    separator = "/",
    linkable = true,
    lastLinkable = false,
    maxItems = 5,
    size = "md",
  } = props;
  const { pathname } = useLocation();

  const linksToRender =
    links === "auto"
      ? splitPath(pathname).map((text, index, paths) => ({
          text,
          url: generateLinkFromRequestedPath(paths.slice(0, index + 1)),
        }))
      : links;

  return (
    <Breadcrumb
      separator={separator}
      maxItems={maxItems}
      className={`${size} ${links !== "auto" ? "not-auto-generated" : ""}`}
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
