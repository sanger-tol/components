// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  setAuth,
  addUserToDB,
  createBoardAndViewAndZone,
  createPopulatedBoardAndGoToPage,
  isInHeadlessMode,
} from "../helpers";
  
test.use({ headless: isInHeadlessMode });

test("Cannot edit others' boards", async ({ page }) => {
  // Sets a user session up for the browser
  await setAuth(page);
  await createPopulatedBoardAndGoToPage(page);
  await expect(page.getByTestId("board-enter-edit-mode-button")).toBeVisible();

  // Add a new user and give them a board in the DB
  // This is not the same user as our browser session
  const { userId } = await addUserToDB();
  const { boardId: otherUserBoard } = await createBoardAndViewAndZone({
    userId: String(userId),
  });
  await page.goto(`/board/${otherUserBoard}`);
  await expect(page.getByTestId("board-enter-edit-mode-button")).not.toBeVisible();
});

test("Warden can edit other peoples boards", async ({ page }) => {
  // Sets a user session up for the browser
  await setAuth(page, ["warden"]);
  await createPopulatedBoardAndGoToPage(page);
  await expect(page.getByTestId("board-enter-edit-mode-button")).toBeVisible();

  // Add a new user and give them a board in the DB
  // This is not the same user as our browser session
  const { userId } = await addUserToDB();
  const { boardId: otherUserBoard } = await createBoardAndViewAndZone({
    userId: String(userId),
  });
  await page.goto(`/board/${otherUserBoard}`);
  await expect(page.getByTestId("board-enter-edit-mode-button")).toBeVisible();
});
