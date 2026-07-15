// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator } from "@playwright/test";

/**
 * Clicks the utility bar button with the testid `testId` on the provided component,
 * including those inside condensed utility bars.
 * @param component Playwright locator handle to the component containing the utility bar
 * @param testId Test ID of the target button
 */
export const clickUtilityBarButton = async (component: Locator, testId: string) => {
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = component.getByTestId("condensed-utility-bar-button");
  const isCondensed = await condensedUtilityBarButton
    .waitFor({ state: "visible", timeout: 500 })
    .then(() => true)
    .catch(() => false);

  if (isCondensed) {
    await condensedUtilityBarButton.dispatchEvent("click");
  }

  // Either way, the target utility bar button is visible and thus available to be clicked
  const targetButton = component.getByTestId(testId);
  await targetButton.waitFor({ state: "attached", timeout: 10_000 });
  await targetButton.click({ force: true, timeout: 10_000 });
}
