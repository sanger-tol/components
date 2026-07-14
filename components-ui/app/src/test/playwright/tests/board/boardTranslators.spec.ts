// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test } from "@playwright/test";
import {
  setAuth,
  isInHeadlessMode,
  insertComponentToBoard,
  insertZoneToBoard,
  sleep,
  enterEditMode,
  createBoardForUser,
} from "../helpers";

test.use({ headless: isInHeadlessMode });
test.beforeEach(async ({ page }) => {
  await setAuth(page);
  const user = await page.evaluate(() => {
    return localStorage.getItem("user");
  });
  const userId = JSON.parse(user || '{}').id;

  const { boardId, zoneId, viewId } = await createBoardForUser({
    userId: String(userId),
    zoneTitle: "Zone 1",
  });

  const secondZoneId = await insertZoneToBoard({
    userId: String(userId),
    viewId,
    title: "Zone 2",
    objectType: "curation",
    order: 2,
  });

  await insertComponentToBoard(
    {
      userId: String(userId),
      componentTitle: `Test Table 1`,
      zoneId,
      order: 1
    }
  );

  await insertComponentToBoard(
    {
      userId: String(userId),
      componentTitle: `Test Table 2`,
      zoneId: secondZoneId!,
      order: 1
    }
  );

  await page.goto(`/board/${boardId}`);
});

test("To one translation", async ({ page }) => {
  
});