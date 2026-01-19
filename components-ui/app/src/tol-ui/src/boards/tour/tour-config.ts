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
        icon: "😎",
        title: "1",
        content: "2",
        selector: "#step1",
        side: "right",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🙈",
        title: "4",
        content: "5",
        selector: "#step2",
        side: "right",
        showControls: true,
        showSkip: true,
      },
    ],
  },
];
