// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test, expect } from "@playwright/test";
import {
  setAuth,
  isInHeadlessMode,
  insertComponentToBoard,
  insertZoneToBoard,
  createBoardForUser,
  createTableConfig,
} from "../../helpers";
import { TRANSLATOR_TEST_INPUTS } from "./boardTranslatorConfigs.config";


test.use({ headless: isInHeadlessMode });
TRANSLATOR_TEST_INPUTS.forEach(({ zoneObjectTypes, TableFields }) => {
  test.describe(() => {
    test.beforeEach(async ({ page }) => {
      await setAuth(page);
      const user = await page.evaluate(() => {
        return localStorage.getItem("user");
      });
      const userId = JSON.parse(user || '{}').id;

      // Create a board with initial species zone
      const { boardId, zoneId, viewId } = await createBoardForUser({
        userId: String(userId),
        zoneTitle: `Zone for ${zoneObjectTypes[0]}`,
        zoneObjectType: zoneObjectTypes[0],
      });
      // Remove the first zone as its created in the above function
      const ZoneObjectTypesWithoutFirst = [...zoneObjectTypes];
      ZoneObjectTypesWithoutFirst.shift();

      // Create additional zones for the remaining zoneObjectTypes
      let zoneIds: string[] = [zoneId];
      for (const zoneObjectType of ZoneObjectTypesWithoutFirst || []) {
        const returnedZoneId = await insertZoneToBoard({
          userId: String(userId),
          viewId,
          title: `Zone for ${zoneObjectType}`,
          objectType: zoneObjectType,
          // The order already has a zone at index 1 so start with +2
          order: zoneObjectTypes.indexOf(zoneObjectType) + 2,
        });
        if (returnedZoneId) {
          zoneIds.push(returnedZoneId);
        }
      }

      // For each new zone, insert a table component with the corresponding TableFields
      for (const [index, newZoneId] of zoneIds.entries()) {
        const field = TableFields[zoneObjectTypes[index]];
        await insertComponentToBoard(
          {
            userId: String(userId),
            componentTitle: `${newZoneId} Table`,
            zoneId: newZoneId,
            order: index + 1,
            config: createTableConfig({ activeOrder: field }),
            objectType: zoneObjectTypes[index]
          }
        );
      }

      await page.goto(`/board/${boardId}`);
    });

    test(`${zoneObjectTypes.join(" -> ")}`, async ({ page }) => {
      const filterString = "ABC";
      const firstRowCounter = page.getByTestId("table-row-counter").nth(1);
      const initialSampleRow = (await firstRowCounter.textContent())?.trim();
      const firstFilterInput = page.getByTestId("Scientific Name-filter-input").first();
      await firstFilterInput.fill(filterString);

      await expect
        .poll(async () => (await firstRowCounter.textContent())?.trim(), {
          timeout: 15000,
          message: "Expected sample row counter to update after filtering by species scientific name",
        })
        .not.toEqual(initialSampleRow);

      const secondFilterInput = await page.getByTestId("Scientific Name-filter-input").nth(1);
      expect(await secondFilterInput.inputValue()).toEqual(filterString);
    });

  });
});
