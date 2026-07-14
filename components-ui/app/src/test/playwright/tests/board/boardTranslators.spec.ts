// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test } from "@playwright/test";
import {
  setAuth,
  isInHeadlessMode,
} from "../helpers";
  
test.use({ headless: isInHeadlessMode });
test.beforeEach(async ({ page, context }) => {
  // Sets a user session up for the browser
  await setAuth(page);
});


test("To one translation", async ({ page }) => {

});
