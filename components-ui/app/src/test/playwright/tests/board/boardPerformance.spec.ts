// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from "@playwright/test";

import { addComponent, enterEditMode } from "../helpers";

test("big table", async ({ page }) => {
  await enterEditMode(page);
  await addComponent(page, 0, "table");
  await clickUtilityBarButton(page, "table-config-button", 0);
});
