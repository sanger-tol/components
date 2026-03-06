// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

export const clickUtilityBarButton = async ({ page, testId }) => {
  // First, try to open the condensed utility bar if it exists
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  if (await condensedUtilityBarButton.isVisible()) {
    await condensedUtilityBarButton.click({ force: true });

    // Target is inside a ClickOverlay popover portal — using dispatchEvent to
    // avoid triggering the document mouseup listener that would close the popover
    // before the React onClick handler fires.
    const targetButton = page.getByTestId(testId);
    await targetButton.waitFor({ state: "visible" });
    await targetButton.dispatchEvent('click');
    return;
  }

  // Then click the target button
  const targetButton = page.getByTestId(testId);
  await targetButton.waitFor({ state: "visible" });
  await targetButton.click({ force: true });
}
