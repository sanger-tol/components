/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TBoardPrivilege } from "../interfaces";

export const PRIVILEGE = {
  BOARD: {
    HIDDEN: "hidden" as TBoardPrivilege,
    VIEWABLE: "viewable" as TBoardPrivilege,
    EDITABLE: "editable" as TBoardPrivilege
  }
} as const;
