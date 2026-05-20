/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test } from "@playwright/test";
import { createBoard } from "./board/createBoard.spec";
import { enterEditMode, setAuth } from "./helpers";
import { addZoneTour, ITourStep } from "../../../tol-ui/src";

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
});

const testTour = async ({ page }, tourConfig: ITourStep[]): Promise<void> => {
  // Assume the tour has already started
  for (const tourStep of tourConfig) {
    const popover = await page.locator("#driver-popover-content");
    expect(popover).toBeVisible();

    const title = await page.locator("#driver-popover-title");
    expect(title).toBeVisible();
    expect(title).toHaveText(tourStep.title);

    const description = await page.locator("#driver-popover-description");
    expect(description).toBeVisible();
    expect(description).toHaveText(tourStep.description);

    // Move to the next step
    await page.locator(".driver-popover-next-btn").click();
  }
};

test("addZone tour", async ({ page }) => {
  const testID = crypto.randomUUID();

  await createBoard({ page, testID });
  await enterEditMode({ page });

  // click add zone button
  const addZoneButton = await page.getByTestId("open-add-zone-modal-button");
  await addZoneButton.click();

  // click tour start button
  const startTourButton = await page.getByTestId("start-add-zone-tour-button");
  await startTourButton.click();

  // expect the tour to commence as defined in the config
  await testTour({ page }, addZoneTour);
});
