// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

import { clickWithRetries, sleep } from "..";

/**
 * Clicks the utility bar button with the testid `testId` on the provided component,
 * including those inside condensed utility bars.
 * @param page The Playwright page handle
 * @param component Playwright locator handle to the component containing the utility bar
 * @param testId Test ID of the target button
 */
export async function clickUtilityBarButton(page: Page, component: Locator, testId: string) {
  // A utility bar button will either be in a utility bar at the top of a component,
  // or it will be hidden in an rs-popover that appears when the condensed utility bar button
  // is clicked.
  await sleep(page);

  // First, check whether a condensed button exists on this component
  const condensedUtilityBarButton = component.getByTestId("condensed-utility-bar-button");
  const hasCondensedButton = (await condensedUtilityBarButton.count()) > 0;

  if (hasCondensedButton) {
    // Open the condensed utility bar to show the requested button, then click it
    await clickWithRetries(page, () => component.getByTestId("condensed-utility-bar-button"));
    await clickWithRetries(page, () => page.locator("#control-id-clickable").getByTestId(testId));
  } else {
    // Directly click the requested button
    await clickWithRetries(page, () => component.getByTestId(testId));
  }
}
