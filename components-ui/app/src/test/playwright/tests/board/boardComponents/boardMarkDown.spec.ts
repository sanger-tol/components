// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setBoard, setAuth, deleteFirstComponent } from '../../helpers'

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
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  if (await condensedUtilityBarButton.isVisible()) {
    await condensedUtilityBarButton.click({ force: true });
  }
}

const previewMarkDownComponent = async ({ page }) => {
  const previewEdit = page.getByTestId("preview-markdown");
  await previewEdit.click({force: true});
}

const editMarkDownComponent = async ({ page }) => {
  const mardownEditor = page.locator('.tol-markdown-viewer textarea');
  // click into the markdown editor and type text to simulate real user input
  await mardownEditor.click();
  await mardownEditor.pressSequentially("Test Text", { delay: 50 });
  await expect(mardownEditor).toHaveValue('Test Text');
  await clickCondensedUtilityBarButton({ page });
  await previewMarkDownComponent({ page });
  // Count is 3, once for preview, editor and saved view (even though only two are visible)
  await expect(page.getByText('Test Text')).toHaveCount(3);
  await clickCondensedUtilityBarButton({ page });
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
  await deleteFirstComponent({ page});
  expect(page.locator('.tol-markdown-viewer')).not.toBeVisible();
});