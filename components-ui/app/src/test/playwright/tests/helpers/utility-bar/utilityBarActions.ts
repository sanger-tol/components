// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";
import { sleep } from "../sleep";

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
  await sleep(200)
  // First, check whether a condensed button exists on this component
  const condensedUtilityBarButton = component.getByTestId("condensed-utility-bar-button");
  if (await condensedUtilityBarButton.count() > 0) {
    await condensedUtilityBarButton.waitFor({ state: "visible", timeout: 500 });
  }
  const isCondensed = await condensedUtilityBarButton
    .waitFor({ state: "visible", timeout: 500 })
    .then(() => true)
    .catch(() => false);

  // If it does, click it, then click the button in the popover
  if (isCondensed) {
    await condensedUtilityBarButton.click();
    const targetButton = page.locator("#control-id-clickable").getByTestId(testId);
    await targetButton.waitFor({ state: "attached", timeout: 1_000 });
    await targetButton.click();
  } else {
    // Just click the button in the utility bar
    const utilityBarButton = component.getByTestId(testId);
    await utilityBarButton.waitFor({ state: "visible", timeout: 500 });
    await utilityBarButton.click();
  }
}
