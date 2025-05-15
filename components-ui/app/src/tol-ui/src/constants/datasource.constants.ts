/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARDS } from "./api.constants";

export const EXCLUDED_DETAIL_CACHE_OBJECTS = [
  BOARDS.COMPONENT,
  BOARDS.ZONE,
  BOARDS.VIEW,
  BOARDS.COMPONENT_ZONE,
  BOARDS.ZONE_VIEW,
  BOARDS.VIEW_BOARD,
  'prefect/flow_run',
];
