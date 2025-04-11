/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardObjectTypes } from "./api.constants";

export const EXCLUDED_DETAIL_CACHE_OBJECTS = [
  BoardObjectTypes.COMPONENT,
  BoardObjectTypes.ZONE,
  BoardObjectTypes.VIEW,
  BoardObjectTypes.COMPONENT_ZONE,
  BoardObjectTypes.ZONE_VIEW,
  BoardObjectTypes.VIEW_BOARD,
  'prefect/flow_run',
];
