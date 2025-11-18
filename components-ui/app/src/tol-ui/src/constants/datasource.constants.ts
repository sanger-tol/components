/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARDS } from "./api.constants";

export const EXCLUDED_DETAIL_CACHE_OBJECTS = [
  BOARDS.BOARD,
  BOARDS.VIEW_BOARD,
  BOARDS.VIEW,
  BOARDS.ZONE_VIEW,
  BOARDS.ZONE,
  BOARDS.COMPONENT_ZONE,
  BOARDS.COMPONENT,
  'flow_run',
  'noCacheTest',
];
