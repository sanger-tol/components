/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IGetList,
  TDataObjectListOrNull
} from "../.."


/* Abstract class for fetching lists of data objects */
export interface ListGetter {
  /* Fetches a list of data objects based on the provided filter and requested fields */
  getList(args: IGetList): Promise<TDataObjectListOrNull>;
}