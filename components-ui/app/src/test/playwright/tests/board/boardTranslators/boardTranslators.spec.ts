// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test, expect } from "@playwright/test";
import {
  setAuth,
  isInHeadlessMode,
  insertComponentToBoard,
  insertZoneToBoard,
  createBoardForUser
} from "../../helpers";
import { 
  SPECIES_TABLE_CONFIG,
  SAMPLE_TABLE_CONFIG
} from "./boardTranslators.config";


test.use({ headless: isInHeadlessMode });
test.beforeEach(async ({ page }) => {
  await setAuth(page);
  const user = await page.evaluate(() => {
    return localStorage.getItem("user");
  });
  const userId = JSON.parse(user || '{}').id;

  // Create a board with initial species zone
  const { boardId, zoneId, viewId } = await createBoardForUser({
    userId: String(userId),
    zoneTitle: "Zone 1",
    zoneObjectType: "species",
  });

  // Add another zone for sample
  const secondZoneId = await insertZoneToBoard({
    userId: String(userId),
    viewId,
    title: "Zone 2",
    objectType: "sample",
    order: 2,
  });

  // Add a table to the species (first) zone
  await insertComponentToBoard(
    {
      userId: String(userId),
      componentTitle: `Test Table 1`,
      zoneId,
      order: 1,
      config: SPECIES_TABLE_CONFIG,
      objectType: "species"
    }
  );

  // Add a table to the sample (second) zone
  await insertComponentToBoard(
    {
      userId: String(userId),
      componentTitle: `Test Table 2`,
      zoneId: secondZoneId!,
      order: 1,
      config: SAMPLE_TABLE_CONFIG,
      objectType: "sample"
    }
  );

  await page.goto(`/board/${boardId}`);
});

test("Many-To-One translation", async ({ page }) => {
  const filterString = "ABC";
  const sampleRowCounter = page.getByTestId("table-row-counter").nth(1);
  const initialSampleRow = (await sampleRowCounter.textContent())?.trim();
  const speciesFilterInput = page.getByTestId("Scientific Name-filter-input").first();

  await speciesFilterInput.fill(filterString);

  await expect
    .poll(async () => (await sampleRowCounter.textContent())?.trim(), {
      timeout: 15000,
      message: "Expected sample row counter to update after filtering by species scientific name",
    })
    .not.toEqual(initialSampleRow);

  const newSampleRow = (await sampleRowCounter.textContent())?.trim();
  expect(newSampleRow).not.toEqual(initialSampleRow);
});