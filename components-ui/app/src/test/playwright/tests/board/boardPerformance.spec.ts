// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test } from "@playwright/test";

import { addComponent, clickUtilityBarButton, enterEditMode } from "../helpers";

test("big table", async ({ page }) => {
  await enterEditMode(page);
  await addComponent(page, 0, "table");
  await clickUtilityBarButton(
    page,
    page.getByTestId("board-component-table"),
    "table-config-button"
  );
});
