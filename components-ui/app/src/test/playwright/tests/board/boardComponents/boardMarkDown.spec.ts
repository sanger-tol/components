// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, test } from '@playwright/test';
import { addComponent, setBoard, deleteBoard, setAuth, addComponentFilter, sleep } from '../../helpers'
import { Markdown } from '../../../../../tol-ui/src';

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
  // get the count before filtering
  const mardownEditor = page.locator('.tol-markdown-viewer textarea');
  await mardownEditor.type("mjk");
  const condensedUtilityBarButton = page.getByTestId("condensed-utility-bar-button");
  await condensedUtilityBarButton.waitFor({ state: 'visible' });
  await condensedUtilityBarButton.click({ force: true });
  const previewEdit = page.getByTestId("preview-markdown");
  await previewEdit.click();
  await condensedUtilityBarButton.waitFor({ state: 'visible' });
  await condensedUtilityBarButton.click({ force: true });
  const saveEdit = page.getByTestId("save-markdown");
  await saveEdit.click();

}

test('manage dashboard', async ({ page }) => {
  const testID = crypto.randomUUID();

  await addMarkdownComponent({page, testID});
  await editMarkDownComponent({page});
});

