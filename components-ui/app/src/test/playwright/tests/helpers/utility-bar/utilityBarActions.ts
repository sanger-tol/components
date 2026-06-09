// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from "@playwright/test";

/**
 * Clicks the `testIdIndex`th utility bar button with test ID `testId`,
 * including those inside condensed utility bars.
 * @param page The Playwright page handle
 * @param testId Test ID of the target button
 * @param testIdIndex Out of all elements with this test ID, which one is it? Zero-indexed
 */
export const clickUtilityBarButton = async (page: Page, testId: string, testIdIndex: number) => {
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  const isCondensed = await condensedUtilityBarButton
    .waitFor({ state: "visible", timeout: 500 })
    .then(() => true)
    .catch(() => false);

  if (isCondensed) {
    await condensedUtilityBarButton.dispatchEvent('click');
  }

  // Either way, the target utility bar button is visible and thus available to be clicked
  const targetButton = page.getByTestId(testId).nth(testIdIndex);
  await targetButton.waitFor({ state: "attached", timeout: 10_000 });
  await targetButton.click({ force: true, timeout: 10_000 });
}
