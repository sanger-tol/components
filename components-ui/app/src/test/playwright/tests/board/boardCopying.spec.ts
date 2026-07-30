// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  setAuth,
  addUserToDB,
  createBoardAndViewAndZone,
  isInHeadlessMode,
  createComponentInZone,
  createPopulatedBoardAndGoToPage,
  createBoardId,
  enterEditMode,
} from "../helpers";
  
test.use({ headless: isInHeadlessMode });
test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: process.env.PLAYWRIGHT_URL ?? "https://localhost:3011",
  });

  // Sets a user session up for the browser
  await setAuth(page);
});

const setupBoardWithComponent = async (page) => {
  // Add a new user and give them a board in the DB
  // This is not the same user as our browser session
  const { userId } = await addUserToDB();
  const { boardId, zoneId } = await createBoardAndViewAndZone({
    userId: String(userId),
    zoneObjectType: "species",
  });

  await createComponentInZone(
    {
      userId: String(userId),
      componentTitle: "Test Table",
      zoneId,
    }
  );

  await page.goto(`/board/${boardId}`);

  await expect(page.getByText("Test Table")).toBeVisible();

  const copyDorpdown = page.getByTestId("board-copy-dropdown");
  await expect(copyDorpdown).toBeVisible();
  await copyDorpdown.click();
}

test("User can copy another users board", async ({ page }) => {
  await setupBoardWithComponent(page);

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

  await expect(page.getByText("Test Table")).toBeVisible();
});


test("User can copy another users view", async ({ page }) => {
  await setupBoardWithComponent(page);

  const copyBoardButton = page.getByTestId("copy-view-id-button");
  await expect(copyBoardButton).toBeVisible();
  await copyBoardButton.click();

  // Create a new board for the view to be imported into
  await createPopulatedBoardAndGoToPage(page);

  await enterEditMode(page);

  const addViewButton = page.getByTestId("board-add-view-button");
  await expect(addViewButton).toBeVisible();
  await addViewButton.click();

  const importViewButton = page.getByTestId("board-import-view-button");
  await expect(importViewButton).toBeVisible();
  await importViewButton.click();

  const viewImportInput = page.getByTestId("view-import-input");
  await expect(viewImportInput).toBeVisible();
  const clipBoardContent: string = await page.evaluate("navigator.clipboard.readText()");
  await viewImportInput.fill(clipBoardContent);

  const confirmButton = page.getByTestId("view-import-confirm-button");
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  await expect(page.getByText("Test Table")).toBeVisible();
});
