/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { fetchHasTourStepBeenSeen, getUserFromLocalStorage, ITourStep } from "..";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function processTour(tourName: string, tourConfig: ITourStep[]) {
  const seen = await fetchHasTourStepBeenSeen(tourName, getUserFromLocalStorage().id);
  if (seen) return;

  const driverObj = driver({
    showProgress: true,
    steps: tourConfig.map(step => ({
      element: `[data-testid="${step.testid}"]`,
      popover: { title: step.title, description: step.description },
    })),
    buttons: ["previous", "next", "close"],
    onDestroyStarted: () => {
      console.log("YOU HAVE BEEN DESTROYED");
      driverObj.destroy();
    },
  });

  driverObj.drive();
}
