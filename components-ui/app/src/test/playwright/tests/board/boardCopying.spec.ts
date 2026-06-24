// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  setAuth,
  addUserToDB,
  createBoardForUser,
  isInHeadlessMode,
} from "../helpers";
  
test.use({ headless: isInHeadlessMode });

test("User can copy another users board", async ({ page }) => {
  // Sets a user session up for the browser
  await setAuth(page);

  // Add a new user and give them a board in the DB
  // This is not the same user as our browser session
  const { userId } = await addUserToDB();
  const otherUserBoard = await createBoardForUser(String(userId));
  await page.goto(`/board/${otherUserBoard}`);

  const copyDorpdown = page.getByTestId("board-copy-dropdown");
  await expect(copyDorpdown).toBeVisible();
  await copyDorpdown.click();

  const copyBoardButton = page.getByText("Copy Board");
  await expect(copyBoardButton).toBeVisible();
  await copyBoardButton.click();

  const titleInput = page.getByTestId("new-title-input");
  await expect(titleInput).toBeVisible();
  await titleInput.fill("My Copied Board");
  await expect(titleInput).toHaveValue("My Copied Board");

  const confirmButton = page.getByTestId("new-title-confirm-button");
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  const boardTitle = page.getByTestId("view-mode-board-title");
  await expect(boardTitle).toBeVisible();
  await expect(boardTitle).toHaveText("My Copied Board"); 
});
