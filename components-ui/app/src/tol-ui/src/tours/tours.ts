/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { getUserFromLocalStorage, ITourStep, TsDataSource, env, LOCAL_API_DATA_PATH } from "..";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * The chief function for UI tours.
 * 
 * Begins a UI tour from the given config, but only if it hasn't yet been seen by the user
 * @param tourName The name to identify this tour by
 * (used to know whether the user has already seen this tour)
 * @param tourConfig Each step forming the content of the tour. This includes which element to
 * highlight each time, and what description it's given.
 * @param showRegardless Whether to ignore whether the user has seen this tour already.
 * This also disables saving whether this tour has been seen to the database.
 * @param storedUserID The ID of the current user. If this is not provided, the user is fetched
 * from local storage. However, if the caller of this function already has the user ID, it can be
 * passed in here for efficiency.
 */
export async function processTour(
  tourName: string,
  tourSteps: ITourStep[],
  showRegardless: boolean = false,
  storedUserID?: string,
) {
  // Fetch user ID if not provided
  let userID: string;
  if (storedUserID) {
    userID = storedUserID;
  } else {
    userID = getUserFromLocalStorage().id;
  }

  const seen = await hasTourBeenSeen(tourName, userID);
  if (seen && !showRegardless) return;

  const driverObj = driver({
    showProgress: true,
    steps: tourSteps.map(step => ({
      element: `[data-testid="${step.testid}"]`,
      popover: { title: step.title, description: step.description },
    })),
    onDestroyStarted: () => {
      if (!showRegardless) registerTourAsSeen(tourName, userID);
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

/**
 * Checks whether a tour (by name) has yet been viewed by the user
 * @param tourName String name of the tour to check
 * @returns Whether the value returned from the database is `true`
 */
export async function hasTourBeenSeen(
  tourName: string,
  userId: string,
): Promise<boolean> {
  // Fetch user details
  const localDataSource = new TsDataSource({
    apiPath: env.API_PATH,
    apiDataPath: LOCAL_API_DATA_PATH
  });
  const user = await localDataSource.getOne({
    objectType: "user",
    id: userId,
  });
  if (!user) return false;

  // if tours_seen is null, no tour has been started, so it must be initiated.
  if (!user.tours_seen) {
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
    apiPath: env.API_PATH,
    apiDataPath: LOCAL_API_DATA_PATH
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
          tours_seen: {
            ...(user.tours_seen || {}),
            [stepName]: true,
          },
        },
      },
    ],
    objectType: "user",
  });
}

export async function disableAllTours(userId: string): Promise<void> {
  await registerTourAsSeen("tour_disabled", userId);
}
