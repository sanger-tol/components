// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import {
  setAuth,
  addUserToDB,
  createBoardForUser,
  setBoard,
  createBoardId,
  isInHeadlessMode,
} from '../helpers';
  
test.use({ headless: isInHeadlessMode });

test('Cannot edit others boards', async ({ page }) => {
  // Sets a user session up for the browser
  const browserUserBoard = createBoardId();
  await setAuth(page);
  await setBoard({ page, boardID: browserUserBoard });
  await expect(page.getByTestId("board-enter-edit-mode-button")).toBeVisible();

  // Add a new user and give them a board in the DB
  // This is not the same user as our browser session
  const { userID } = await addUserToDB();
  const otherUserBoard = await createBoardForUser(String(userID));
  await page.goto(`/board/${otherUserBoard}`);
  await expect(page.getByTestId("board-enter-edit-mode-button")).not.toBeVisible();
});
