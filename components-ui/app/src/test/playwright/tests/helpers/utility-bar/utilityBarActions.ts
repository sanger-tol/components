// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { sleep } from "../sleep";

export const clickUtilityBarButton = async ({ page, testId }) => {
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  const isCondensed = await condensedUtilityBarButton
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false);

if (isCondensed) {
  let retries = 3;
  while (retries > 0) {
    try {
      await condensedUtilityBarButton.click({ timeout: 5000 });
      break;
    } catch {
      retries--;
      if (retries === 0) throw new Error("condensed-utility-bar-button could not be clicked after retries");
      await sleep(200);
    }
  }
}

const targetButton = page.getByTestId(testId);
await targetButton.waitFor({ state: "attached" }); // wait for it to exist in DOM
await targetButton.click({ force: true, timeout: 10000 });
}
