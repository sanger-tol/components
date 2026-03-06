// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { sleep } from "../sleep";

export const clickUtilityBarButton = async ({ page, testId }) => {
  await sleep(500);
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  if (await condensedUtilityBarButton.isVisible()) {
    await condensedUtilityBarButton.click({ force: true });
    await sleep(500);
  }
  
  await sleep(500);
  // Then click the target button
  const targetButton = page.getByTestId(testId);
  await targetButton.click({ force: true });
}