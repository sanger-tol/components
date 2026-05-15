/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ITourStep, TsDataSource, env, LOCAL_API_DATA_PATH, useAuth } from "..";
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
 * @param storedUserId The ID of the current user. If this is not provided, the user is fetched
 * from local storage. However, if the caller of this function already has the user ID, it can be
 * passed in here for efficiency.
 */
export async function processTour(
  tourName: string,
  tourSteps: ITourStep[],
  showRegardless: boolean = false
) {
  const seen = await hasTourBeenSeen(tourName);
  if (seen && !showRegardless) return;

  const driverObj = driver({
    showProgress: true,
    steps: tourSteps.map(step => ({
      element: `[data-testid="${step.testid}"]`,
      popover: { title: step.title, description: step.description },
    })),
    onDestroyStarted: () => {
      if (!showRegardless) registerTourAsSeen(tourName);
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
  tourName: string
): Promise<boolean> {
  const user = useAuth().user;
  
  // Fetch toursSeen either from the database or from localStorage
  let toursSeen: Record<string, boolean> | null;
  if (user) {
    toursSeen = user.tours_seen;
  } else {
    const stored = localStorage.getItem("toursSeen");

    if (stored) {
      toursSeen = JSON.parse(stored)
    } else {
      toursSeen = null;
    }
  }

  // If toursSeen is null, no tours have been started at all.
  // No key checks need to be done here. When the current tour completes,
  // the resulting upset will create the object
  if (!toursSeen) {
    return false;
  }

  // Explicitly check whether this specific tour has been seen already
  return toursSeen[tourName] == true
}

/**
 * Updates tours_seen in the user table to register a tour step as being viewed by the user
 * @param tourName The name of the tour to register as seen
 */
export async function registerTourAsSeen(
  tourName: string
): Promise<void> {
  const user = useAuth().user;

  if (user) {
    // Upsert into the user table
    await new TsDataSource({
      apiPath: env.API_PATH,
      apiDataPath: LOCAL_API_DATA_PATH
    }).upsert({
      payload: [
        {
          type: "user",
          id: user.id,
          attributes: {
            tours_seen: {
              ...(user.tours_seen || {}),
              [tourName]: true,
            },
          },
        },
      ],
      objectType: "user",
    });
  } else {
    // Add the new tour
    let toursSeen = {};
    toursSeen[tourName] = true;

    // Add all saved tours
    const storedTours = localStorage.getItem("toursSeen");
    if (storedTours) {
      toursSeen = {
        ...toursSeen,
        ...JSON.parse(storedTours)
      };
    }

    // Save to localStorage
    localStorage.setItem("toursSeen", JSON.stringify(toursSeen));
  }
}
