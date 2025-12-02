// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setBoard, setAuth, sleep } from '../../helpers'

const headless = !!(process.env.CI || process.env.HEADLESS);
const BOARD_ID = crypto.randomUUID();

test.use({headless: headless});

test.beforeEach(async ({ page }) => {
  await setAuth({page});
  await setBoard({page, boardID: BOARD_ID });
});

const addMarkdownComponent = async ({page, testID}) => {
  addComponent({page, testID}, 'text', 'Small');

  await sleep(200);
  await expect(page.locator('.tol-markdown-viewer')).toBeVisible();
}

const editMarkDownComponent = async ({page}) => {
  const mardownEditor = page.locator('.tol-markdown-viewer textarea');
  await mardownEditor.fill("Test Text");
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  // We have these try catches because for some reason firrefox sometimes thinks the element is not clickable
  // But if you try to use force with Chrome it fails? Needs a bit more research
  // check that the text is on the page
  await expect(mardownEditor).toHaveValue('Test Text');
  try {
    await condensedUtilityBarButton.click();
  } catch (e) {
    await condensedUtilityBarButton.click({ force: true });
  }
  const previewEdit = page.getByTestId("preview-markdown");
  try {
    await previewEdit.click();
  } catch (e) {
    await previewEdit.click({force: true});
  }
  // once in editor, once in preview, once in viewer
  await expect(page.getByText('Test Text')).toHaveCount(3);
  try {
    await condensedUtilityBarButton.click();
  } catch (e) {
    await condensedUtilityBarButton.click({ force: true });
  }
  const saveEdit = page.getByTestId("save-markdown");
  try {
    await saveEdit.click();
  } catch (e) {
    await saveEdit.click({force: true});
  }

}

test('manage dashboard', async ({ page }) => {
  const testID = crypto.randomUUID();

  await addMarkdownComponent({page, testID});
  await editMarkDownComponent({page});
});

