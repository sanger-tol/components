/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ITourStep } from "..";

export const EDIT_MODE_TOUR: ITourStep[] = [
  {
    testid: "",
    title: "Editing a dashboard",
    description: (
      "This is the dashboard editor. Beware if your board is published; " +
      "any changes you make will immediately update for anyone using it."
    )
  },
  {
    testid: "board-add-view-button",
    title: "Views",
    description: (
      "Dashboard have a logical (and visual) hierarchy. " +
      "They contain one or more Views of your data, which are like tabs in a spreadsheet."
    )
  },
  {
    testid: "open-add-zone-modal-button",
    title: "Zones",
    description: (
      "Within these views you can have multiple Zones, which are sections of the dashboard " +
      "with a specified object type. Within each Zone, you can add multiple Components, which " +
      "allow you to visualise your data (such as a table or a chart)."
    )
  }
];

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
