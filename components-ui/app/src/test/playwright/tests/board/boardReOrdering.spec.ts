// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  setAuth,
  enterEditMode,
  isInHeadlessMode,
  createBoardForUser,
  insertComponentToBoard,
} from "../helpers";


test.use({ headless: isInHeadlessMode });

test.beforeEach(async ({ page }) => {
  await setAuth(page);
  const user = await page.evaluate(() => {
    return localStorage.getItem("user");
  });
  const userId = JSON.parse(user || '{}').id;

  const { boardId, zoneId } = await createBoardForUser(String(userId));
  await insertComponentToBoard(
    {
      userId: String(userId),
      componentTitle: "Test Table 1",
      zoneId,
      order: 1
    }
  );

  await insertComponentToBoard(
    {
      userId: String(userId),
      componentTitle: "Test Table 2",
      zoneId,
      order: 2,
    }
  );
  await page.goto(`/board/${boardId}`);
  await enterEditMode(page);
});

// This test will fail until the re-ordering of components is fixed
test("Can re-order components", async ({ page }) => {
  await page.getByTestId("board-layout-mode-button").click();
  const table1 = page.getByTestId("draggable-Test Table 1");
  const table2 = page.getByTestId("draggable-Test Table 2");
  await expect(table1).toBeVisible();
  await expect(table2).toBeVisible();

  await table2.scrollIntoViewIfNeeded();
  // Try this if the manual mouse click and move fails to work
  // await table2.dragTo(table1);
  const sourceBox = await table2.boundingBox();
  const initialXPosition = (await table1.boundingBox())?.x;
  const initialYPosition = (await table1.boundingBox())?.y;

  if (!sourceBox) {
    throw new Error("Could not determine the draggable component position");
  }

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(0, 0, { steps: 15});
  await page.mouse.up();

  // Assuming table 2 is where table 1 was initially
  await expect((await table2.boundingBox())?.x).toBe(initialXPosition);
  await expect((await table2.boundingBox())?.y).toBe(initialYPosition);
});
