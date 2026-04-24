// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { sleep } from "../sleep";

export const clickUtilityBarButton = async ({ page, testId }) => {
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  const isCondensed = await condensedUtilityBarButton
    .waitFor({ state: "visible", timeout: 500 })
    .then(() => true)
    .catch(() => false);

  if (isCondensed) {
    await condensedUtilityBarButton.dispatchEvent('click');
  }

  const targetButton = page.getByTestId(testId);
  await targetButton.waitFor({ state: "attached", timeout: 10000 });
  await targetButton.click({ force: true, timeout: 10000 });
}
