// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { sleep } from "../sleep";

export const clickUtilityBarButton = async ({ page, testId }) => {
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  if (await condensedUtilityBarButton.isVisible()) {
    await condensedUtilityBarButton.waitFor({ state: "visible" });
    await condensedUtilityBarButton.click();
    await sleep(200); // wait for the utility bar to expand
  }

  // Then click the target button
  const targetButton = page.getByTestId(testId);
  await targetButton.waitFor({ state: "visible" });
  await targetButton.click();
}
