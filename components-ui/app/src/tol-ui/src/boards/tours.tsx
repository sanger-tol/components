/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getUserFromLocalStorage, ITourStep, TsDataSource } from "..";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * Begins a UI tour from the given config, but only if it hasn't yet been seen by the user
 * @param tourName The name to identify this tour by
 * (used to know whether the user has already seen this tour)
 * @param tourConfig Each step forming the content of the tour. This includes which element to
 * highlight each time, and what description it's given.
 */
export async function processTour(tourName: string, tourConfig: ITourStep[]) {
  const userID = getUserFromLocalStorage().id;

  const seen = await hasTourBeenSeen(tourName, userID);
  if (seen) return;

  const driverObj = driver({
    showProgress: true,
    steps: tourConfig.map(step => ({
      element: `[data-testid="${step.testid}"]`,
      popover: { title: step.title, description: step.description },
    })),
    showButtons: ["previous", "next", "close"],
    onDestroyStarted: () => {
      // registerTourAsSeen(tourName, userID);
      console.log("YOU HAVE BEEN DESTROYED!");
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

/**
 * Checks whether a dashboard tour step (by name) has yet been viewed by the user
 * @param tourName String name of the tour to check
 * @returns Whether the value returned from the database is `true`
 */
export async function hasTourBeenSeen(
  tourName: string,
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
  if (!user.tours_seen && tourName === "initial") {
    return false;
  }

  // Check whether the tour is enabled and the specified step has been completed
  return (
    user.tours_seen?.tour_disabled == true ||
    user.tours_seen?.[tourName] == true
  );
}

/**
 * Updates tours_seen in the user table to register a tour step as being viewed by the user
 * @param stepName The name of the tour step to register as seen
 * @param userId The string id of the user to set this data on
 */
export async function registerTourAsSeen(
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

// TODO Deprecated
export async function disableTour(userId: string): Promise<void> {
  await registerTourAsSeen("tour_disabled", userId);
}
