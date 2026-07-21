// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";
import { sleep } from "../sleep";

const clickWithRetries = async (
  getLocator: () => Locator,
  attempts: number = 5,
  timeoutMs: number = 1_500
) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const locator = getLocator();
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      await locator.click({ timeout: timeoutMs });
      return;
    } catch (error) {
      lastError = error;
      await sleep(100 * (attempt + 1));
    }
  }

  throw lastError;
};

/**
 * Clicks the utility bar button with the testid `testId` on the provided component,
 * including those inside condensed utility bars.
 * @param page The Playwright page handle
 * @param component Playwright locator handle to the component containing the utility bar
 * @param testId Test ID of the target button
 */
export const clickUtilityBarButton = async (page: Page, component: Locator, testId: string) => {
  // A utility bar button will either be in a utility bar at the top of a component,
  // or it will be hidden in an rs-popover that appears when the condensed utility bar button
  // is clicked.
  await sleep(200);

  // First, check whether a condensed button exists on this component
  const condensedUtilityBarButton = component.getByTestId("condensed-utility-bar-button");
  const hasCondensedButton = (await condensedUtilityBarButton.count()) > 0;

  // If condensed controls are present, prefer that path and fall back to direct click
  // when the component re-renders during interactions.
  if (hasCondensedButton) {
    try {
      await clickWithRetries(() => component.getByTestId("condensed-utility-bar-button"));
      await clickWithRetries(() => page.locator("#control-id-clickable").getByTestId(testId));
      return;
    } catch {
      // Fall back to a direct utility-bar click if condensed interactions are unstable.
    }
  }

  await clickWithRetries(() => component.getByTestId(testId));
};
