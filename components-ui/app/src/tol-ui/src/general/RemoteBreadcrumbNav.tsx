/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BreadcrumbNav, type TsDataSource, type PBreadcrumbNav } from "..";

export interface PRemoteBreadcrumbNav extends PBreadcrumbNav {
  dataSource: TsDataSource;
  objectType: string;
  attributes: string[];
  baseUrl: string;
}

export function RemoteBreadcrumbNav(props: PRemoteBreadcrumbNav) {
  const { dataSource, attributes, objectType, baseUrl, ...breadcrumbProps } =
    props;

  return <BreadcrumbNav {...breadcrumbProps} />;
}
