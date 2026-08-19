// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";
import {
  addComponent,
  configureTable,
  createBoardAndViewAndZone,
  enterEditMode,
  isInHeadlessMode,
  setAuth,
} from "../helpers";

test.use({ headless: isInHeadlessMode });

test("User can select provenances in a table", async ({ page }) => {
  // Set up a new user session
  const userId = await setAuth(page);
  
  // Use a zone with an object type that has provenance
  const { boardId } = await createBoardAndViewAndZone({
    userId,
    zoneDataSourceInstanceId: "test",
    zoneObjectType: "record",
  });

  // Navigate to the newly created board and enter edit mode
  await page.goto(`/board/${boardId}`);
  await enterEditMode(page);

  // Add a table to the zone
  await addComponent(page, page.getByTestId("zone"), "table");

  // Add a scientific column, and 3 others for each specific source
  await configureTable(
    page,
    page.getByTestId("board-component-table"),
    {
      activeColumns: ["big_string"],
      provenances: {
        "big_string": ["calc", "source1", "source2"]
      }
    }
  );
  // Check all 4 columns are visible
  await expect(await page.getByText("Scientific Name").count()).toBe(3);
});
