/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ITourStep, TsDataSource, LOCAL_DS } from "..";
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
 * @param userId The ID of the current user. `null` if not authenticated.
 * You can get this value with the `useAuth` hook.
 * @param showRegardless Whether to ignore whether the user has seen this tour already.
 * This also disables saving whether this tour has been seen to the database.
 */
export async function processTour(
  tourName: string,
  tourSteps: ITourStep[],
  userId: string | null,
  showRegardless: boolean = false
) {
  const seen = await hasTourBeenSeen(tourName, userId);
  if (seen && !showRegardless) return;

  const driverObj = driver({
    showProgress: true,
    steps: tourSteps.map(step => ({
      element: `[data-testid="${step.testid}"]`,
      popover: { title: step.title, description: step.description },
    })),
    onDestroyStarted: () => {
      if (!showRegardless) registerTourAsSeen(tourName, userId);
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

/**
 * Retrieves the tours dictionary from the user table or local storage
 * @param userId The ID of the current user. `null` if not authenticated.
 * You can get this value with the `useAuth` hook.
 * @param dataSource Allows you to override the data source used to connect to the user table
 */
export async function fetchToursSeen(
  userId: string | null,
  dataSource: TsDataSource = LOCAL_DS
): Promise<Record<string, boolean>> {
  // Fetch toursSeen either from the database or from localStorage
  if (userId) {
    const user = await dataSource.getOne({
      objectType: "user",
      id: userId,
      requestedFields: ["tours_seen"]
    });
    if (!user) {
      console.error("Failed to fetch the logged in user")
      return {};
    }

    return user.tours_seen || {};
  } else {
    const stored = localStorage.getItem("toursSeen");

    if (stored) {
      return JSON.parse(stored)
    } else {
      return {};
    }
  }
}

/**
 * Checks whether a tour (by name) has yet been viewed by the user
 * @param tourName String name of the tour to check
 * @param userId The ID of the current user. `null` if not authenticated.
 * You can get this value with the `useAuth` hook.
 * @param dataSource Allows you to override the data source used to connect to the user table
 * @returns Whether the value returned from the database is `true`
 */
export async function hasTourBeenSeen(
  tourName: string,
  userId: string | null,
  dataSource: TsDataSource = LOCAL_DS
): Promise<boolean> {  
  // Fetch every tour
  const toursSeen = await fetchToursSeen(userId, dataSource);

  // Explicitly check whether this specific tour has been seen already
  return toursSeen[tourName] == true
}

/**
 * Updates tours_seen in the user table to register a tour step as being viewed by the user
 * @param tourName The name of the tour to register as seen
 * @param user The ID of the current user. `null` if not authenticated.
 * You can get this value with the `useAuth` hook.
 * @param dataSource Allows you to override the data source used to connect to the user table
 */
export async function registerTourAsSeen(
  tourName: string,
  userId: string | null,
  dataSource: TsDataSource = LOCAL_DS
): Promise<void> {
  const toursSeen = await fetchToursSeen(userId, dataSource);

  if (userId) {
    // Upsert into the user table
    dataSource.upsert({
      payload: [
        {
          type: "user",
          id: userId,
          attributes: {
            tours_seen: {
              ...toursSeen,
              [tourName]: true,
            },
          },
        },
      ],
      objectType: "user",
    });
  } else {
    // Add the new tour
    toursSeen[tourName] = true;

    // Save to localStorage
    localStorage.setItem("toursSeen", JSON.stringify(toursSeen));
  }
}
