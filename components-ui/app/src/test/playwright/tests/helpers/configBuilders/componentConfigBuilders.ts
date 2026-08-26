/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ITableConfigOptions } from "./interfaces";
import {
  IFieldMeta
} from "../../../../../tol-ui/src/index"


/**
 * Function to create a table configuration object for a component, based on the provided options.
 * @param activeOrder - An array of strings representing the order of active fields in the table.
 * @param inactiveOrder - An array of strings representing the order of inactive fields in the table.
 * @param limitVisibility - A boolean indicating whether to limit the visibility of certain fields.
 * @returns An object containing the fieldMeta configuration for the table component.
 */
export function createTableConfig({
  activeOrder = [],
  inactiveOrder = [],
  limitVisibility = false
}: ITableConfigOptions): { fieldMeta: IFieldMeta } {
  return {
    fieldMeta: {
      data: {},
      order: {
        active: activeOrder,
        inactive: inactiveOrder,
        limitVisibility: limitVisibility
      }
    }
  };
}