// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

export const enterEditMode = async (
  { page },
) => {
  // click the add component button
  await page.getByTestId("board-enter-edit-mode-button").click();
};

export const exitEditMode = async (
  { page },
) => {
  // click the exit edit mode button
  await page.getByTestId("board-exit-edit-mode-button").click();
};
