/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useLocation } from "react-router-dom";
import {
  BreadcrumbNav,
  useQueryData,
  fetchAttributes,
  constructRemoteLinks,
  type TsDataSource,
  type PBreadcrumbNav,
  type TDataObjectListOrNull,
} from "..";

export interface PRemoteBreadcrumbNav extends PBreadcrumbNav {
  /**
   * The data source to fetch the object attributes from. This should be an instance of `TsDataSource`.
   */
  dataSource: TsDataSource;
  /**
   * The type of the object for which the breadcrumb navigation is being generated.
   * This is used to fetch the relevant attributes from the data source.
   */
  objectType: string;
  /**
   * The list of attributes to fetch for the object.
   * These attributes will be used to construct the breadcrumb links.
   */
  attributes: string[];
  /**
   * The function that constructs the URL in the required way
   */
  urlConstructFn: (attribute: string, value: string) => string;
  /**
   * Optional. The ID of the object for which the breadcrumb navigation is being generated.
   * Will be auto-generated if no value is provided, based on the current URL path.
   */
  objectId?: string;
}

export function RemoteBreadcrumbNav(props: PRemoteBreadcrumbNav) {
  const {
    dataSource,
    attributes,
    objectType,
    urlConstructFn,
    ...breadcrumbProps
  } = props;

  const { pathname } = useLocation();
  const objectId = props.objectId ?? pathname.split("/").pop() ?? "";

  const { data: objectAttributes, isLoading } =
    useQueryData<TDataObjectListOrNull>(
      ["fetchNavAttributes", objectType, objectId],
      async () =>
        await fetchAttributes(dataSource, objectType, attributes, objectId),
      { enabled: !!objectId },
    );

  const remoteLinks = constructRemoteLinks(
    objectAttributes,
    attributes,
    urlConstructFn,
  );

  const ellipsisPlaceholder = { text: "...", url: undefined };

  const linksToRender =
    remoteLinks && remoteLinks.length > 0
      ? remoteLinks
      : attributes.map(() => ellipsisPlaceholder);

  return (
    <BreadcrumbNav
      {...breadcrumbProps}
      links={linksToRender}
      isLoading={isLoading}
    />
  );
}
