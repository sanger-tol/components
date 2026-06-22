// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  setAuth,
  enterEditMode,
  addComponent,
  isInHeadlessMode,
  createZone,
} from "../helpers";
  
test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
});


test("User can create a board", async ({ page }) => {

    // Navigate to profile dropdown and click My Boards
    const profileDropdown = page.getByTestId("profile-dropdown");
    await expect(profileDropdown).toBeVisible();
    await profileDropdown.click();
    await page.getByRole("link", { name: "My Boards" }).click();

    // Create a new board
    await page.getByTestId("create-new-board-button").click();

    // Add a new zone
    await createZone(page);

    await enterEditMode(page);
    // Add a new component to the zone
    await addComponent(page, 0, "table");
});
