/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IGetListPage,
  TDataObjectListOrNull
} from "../.."


/* Abstract class for fetching lists of data objects */
export interface PageGetter {
  /* Fetches a list of data objects based on the provided filter and requested fields */
  getListPage(args: IGetListPage): Promise<TDataObjectListOrNull>;
}