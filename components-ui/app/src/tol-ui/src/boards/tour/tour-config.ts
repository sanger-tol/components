/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Tour } from "nextstepjs";

export const boardTour: Tour[] = [
  {
    tour: "initialTour",
    steps: [
      {
        title: " Select Dataspace",
        content: "Choose where your board will live. Dataspaces help you organize boards by project, team, or topic.",
        selector: "#step1",
        side: "right",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Select Object Type",
        content: "Select an Object Type to define the structure of your board.",
        selector: "#step2",
        side: "right",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Enter Title",
        content: "Enter a Title for your board to identify it easily.",
        selector: "#step3",
        side: "right",
        showControls: true,
        showSkip: true,
      },
    ],
  },
];
