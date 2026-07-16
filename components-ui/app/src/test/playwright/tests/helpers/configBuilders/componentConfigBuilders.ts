/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ITableConfigOptions } from "./interfaces";


export const createTableConfig = ({
  activeOrder = [],
  inactiveOrder = [],
  limitVisibility = false
}: ITableConfigOptions) => {
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