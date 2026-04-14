/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getUserFromLocalStorage, ITourStep, TsDataSource } from "..";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * Checks whether a dashboard tour step (by name) has yet been viewed by the user
 * @param stepName String name of the tour step to check
 * @returns Whether the value returned from the database is `true`
 */
export async function fetchHasTourStepBeenSeen(
  stepName: string,
  userId: string,
): Promise<boolean> {
  // Fetch user details
  const localDataSource = new TsDataSource({
    apiPath: "/api/v1/local",
  });
  const user = await localDataSource.getOne({
    objectType: "user",
    id: userId,
  });
  if (!user) return false;

  // if tours_seen is null, no tour has been started, so it must be initiated.
  if (!user.tours_seen && stepName === "initial") {
    return false;
  }

  // Check whether the tour is enabled and the specified step has been completed
  return (
    user.tours_seen?.tour_disabled == true ||
    user.tours_seen?.[stepName] == true
  );
}

/**
 * Updates tours_seen in the user table to register a tour step as being viewed by the user
 * @param stepName The name of the tour step to register as seen
 * @param userId The string id of the user to set this data on
 */
export async function registerTourStepAsSeen(
  stepName: string,
  userId: string,
): Promise<void> {
  // Fetch user details
  const localDataSource = new TsDataSource({
    apiPath: "/api/v1/local",
  });
  const user = await localDataSource.getOne({
    objectType: "user",
    id: userId,
  });
  if (!user) return;

  // Perform modification
  await localDataSource.upsert({
    payload: [
      {
        type: "user",
        id: userId,
        attributes: {
          tour_steps_seen: {
            ...(user.tours_seen || {}),
            [stepName]: true,
          },
        },
      },
    ],
    objectType: "user",
  });
}

export async function disableTour(userId: string): Promise<void> {
  await registerTourStepAsSeen("tour_disabled", userId);
}

export async function processTour(tourName: string, tourConfig: ITourStep[]) {
  const userID = getUserFromLocalStorage().id;

  const seen = await fetchHasTourStepBeenSeen(tourName, userID);
  if (seen) return;

  const driverObj = driver({
    showProgress: true,
    steps: tourConfig.map(step => ({
      element: `[data-testid="${step.testid}"]`,
      popover: { title: step.title, description: step.description },
    })),
    buttons: ["previous", "next", "close"],
    onDestroyStarted: () => {
      registerTourStepAsSeen(tourName, userID);
      driverObj.destroy();
    },
  });

  driverObj.drive();
}
