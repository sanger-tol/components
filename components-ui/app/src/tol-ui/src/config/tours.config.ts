/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ITourStep } from "..";

export const ADD_ZONE_TOUR: ITourStep[] = [
  {
    testid: "zoneModal",
    title: "Zones",
    description: (
      "Zones are containers for board components (such as tables and charts) " + 
      "that work with the same type of data (object type)."
    )
  },
  {
    testid: "dataspace-picker",
    title: "Dataspace",
    description: (
      "The set of data this zone will pull from. " + 
      "If in doubt, use ToL Production"
    ),
  },
  {
    testid: "object-type-picker",
    title: "Object Type",
    description: "The kind of data contained in this zone"
  }
];
