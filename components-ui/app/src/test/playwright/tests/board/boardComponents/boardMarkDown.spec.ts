// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setBoard, setAuth } from '../../helpers'

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = crypto.randomUUID();

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
  await setBoard({ page, boardID: BOARD_ID });
});

const addMarkdownComponent = async ({ page, testID }) => {
  addComponent({ page, testID }, 'text', 'Small');
  await expect(page.locator('.tol-markdown-viewer')).toBeVisible();
}

const clickCondensedUtilityBarButton = async ({ page }) => {
  // This test uses force true for clicking because fireFox can have issues clicking small elements
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  await condensedUtilityBarButton.click();
}

const editMarkDownComponent = async ({ page }) => {
  const mardownEditor = page.locator('.tol-markdown-viewer textarea');
  // click into the markdown editor and type text to simulate real user input
  await mardownEditor.click();
  await mardownEditor.pressSequentially("Test Text", { delay: 50 });
  await expect(mardownEditor).toHaveValue('Test Text');
  clickCondensedUtilityBarButton({ page });
  previewMarkDownComponent({ page });
  // Count is 3, once for preview, editor and saved view (even though only two are visible)
  await expect(page.getByText('Test Text')).toHaveCount(3);
  clickCondensedUtilityBarButton({ page });
}

const previewMarkDownComponent = async ({ page }) => {
  const previewEdit = page.getByTestId("preview-markdown");
  // Should avoid using force: true where possible, but for overlays it is needed
  await previewEdit.click({force: true});
}

const saveMarkDownComponent = async ({ page }) => {
  const saveEdit = page.getByTestId("save-markdown");
  await saveEdit.click({force: true});
}

test('manage dashboard', async ({ page }) => {
  const testID = crypto.randomUUID();

  await addMarkdownComponent({ page, testID });
  await editMarkDownComponent({ page });
  await saveMarkDownComponent({ page });
});

