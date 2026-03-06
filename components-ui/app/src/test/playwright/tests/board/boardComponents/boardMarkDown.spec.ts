// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setBoard, setAuth, deleteFirstComponent, clickUtilityBarButton, sleep, enterEditMode, exitEditMode } from '../../helpers'

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = crypto.randomUUID();

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
  await setBoard({ page, boardID: BOARD_ID });
  await enterEditMode({ page });
});

test.afterEach(async ({ page }) => {
  await exitEditMode({ page });
});

const addMarkdownComponent = async ({ page }) => {
  await addComponent({ page }, 'text', 'Small');
  await expect(page.locator('.tol-markdown-viewer')).toBeVisible();
}

const editMarkDownComponentOnAdd = async ({ page }) => {
  // get the markdown editor textarea
  const mardownEditor = page.locator('.tol-markdown-viewer textarea');

  // click into the markdown editor and type text to simulate real user input
  await mardownEditor.click();
  await page.keyboard.type("Test Text", { delay: 10 });
  await sleep(1000);
  await expect(mardownEditor).toHaveValue('Test Text');

  // click the preview button
  await clickUtilityBarButton({ page, testId: "preview-markdown" });

  // Count is 3, once for preview, editor and saved view (even though only two are visible)
  await expect(page.getByText('Test Text')).toHaveCount(3);
}

const saveMarkDownComponent = async ({ page }) => {
  await clickUtilityBarButton({ page, testId: "save-markdown" });
}

test('manage dashboard', async ({ page }) => {
  await addMarkdownComponent({ page });
  await editMarkDownComponentOnAdd({ page });
  await saveMarkDownComponent({ page });
  await deleteFirstComponent({ page, componentType: "text" });
  expect(page.locator('.tol-markdown-viewer')).not.toBeVisible();
});
