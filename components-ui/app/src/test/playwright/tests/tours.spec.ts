/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, Page, test } from "@playwright/test";
import { createBoard, enterEditMode, setAuth } from "./helpers";

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
});

const performAddZoneTour = async (page: Page): Promise<void> => {
  // Assume the tour has already started
  const tourConfig = [
    {
      testid: "zoneModal",
      title: "Zones",
      description: (
        "Zones are containers for board components (such as tables and charts) " + 
        "that work with the same type of data (object type)."
      )
    },
    {
      testid: "dataspace-picker",
      title: "Dataspace",
      description: (
        "The set of data this zone will pull from. " + 
        "If in doubt, use ToL Production"
      ),
    },
    {
      testid: "object-type-picker",
      title: "Object Type",
      description: "The kind of data contained in this zone"
    }
  ];

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

test("Automatically triggered addZone tour", async ({ page }) => {
  const testID = crypto.randomUUID();

  await createBoard({ page, testID });
  await enterEditMode({ page });

  // click add zone button
  const addZoneButton = await page.getByTestId("open-add-zone-modal-button");
  await addZoneButton.click();

  // Make sure the tour hasn't been seen so the tour automatically triggers
  await page.evaluate(() => localStorage.setItem("toursSeen", "{}"));

  // expect the tour to commence as defined in the config
  await performAddZoneTour(page);
});

test("Manyally triggered addZone tour", async ({ page }) => {
  const testID = crypto.randomUUID();

  await createBoard({ page, testID });
  await enterEditMode({ page });

  // click add zone button
  const addZoneButton = await page.getByTestId("open-add-zone-modal-button");
  await addZoneButton.click();

  // Make sure the tour has been seen so it doesn't trigger automatically
  await page.evaluate(() => localStorage.setItem("toursSeen", "{ \"addZone\": true }"));

  // Manually trigger the tour by clicking the tour start button
  const startTourButton = await page.getByTestId("start-add-zone-tour-button");
  await startTourButton.click();

  // expect the tour to commence as defined in the config
  await performAddZoneTour(page);
});
