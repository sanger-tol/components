// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect } from '@playwright/test';

import sql from '../db';
import { test } from '../fixtures';

const userID = "1000021";
const orcidID = "https://orcid.org/0000-0000-0000-0000";

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({headless: headless});

const setAuth = async ({page, token}) => {
  const storageData = {
    user: {
      "oidc_id": orcidID,
      "token_created_at": "2025-03-31T14:13:36.345558",
      "token_expires_at": "2090-04-07T14:13:36.345581",
      "id": userID,
      "roles": []
    },
    'token': token,
  };

  await page.context().setExtraHTTPHeaders({
    'token': token,
  });

  await page.goto('/');

  await page.evaluate((data) => {
    Object.keys(data).forEach((key) => {
      localStorage.setItem(key, JSON.stringify(data[key]));
    });
  }, storageData);

  await page.reload();
  await page.waitForLoadState('load');
};

test.beforeAll(async ({token}) => {
  // insert the admin role if not there already
  try {
    await sql.unsafe(`INSERT INTO "role" VALUES (1, 'admin');`).simple();
    }
  catch (e) {
  };

  // insert the rest
  try {
    await sql.unsafe(`INSERT INTO "user"
    VALUES (${userID}, '${orcidID}');
    
    INSERT INTO role_binding
    VALUES (83489247, ${userID}, 1);
    
    INSERT INTO "token"
    VALUES (3498237, '${token}', NOW(), NOW() + INTERVAL '1 YEAR', ${userID});`).simple();    
  }
  catch (e) {
    console.error(e);
  };
});

const createBoard = async ({page, testID}) => {
  await page.goto('/my-boards');

  // click the create new board button
  await page.click('#create-new-board-button');

  // click the modal
  await page.getByText('Create New Board').click();

  // name the board
  await page.getByRole('textbox').fill(testID);

  // save the board
  await page.getByRole('button', {name: 'Create'}).click();

  // check board is there (on first page?)
  expect(page.locator('body')).toContainText(testID);
};

const deleteBoard = async({page, testID}) => {
  await page.goto('/my-boards');

  // find the correct board row
  const boardRow = await page.getByTestId(testID);

  // click the dropdown button
  await boardRow.locator(".my-boards-dropdown-buttons").click();

  // click the delete button
  await page.locator('span').filter({ hasText: /^Delete$/, visible: true, exact: true }).click();

  // find the first confirm button
  // TODO something is really weird here... why are there multiple?
  const firstConfirm = await page.locator('span').filter({ hasText: /^Confirm$/, visible: true, exact: true }).first();

  console.log(firstConfirm);

  // click the confirm button
  await firstConfirm.click();
};

test('manage dashboard', async ({ page, token }) => {
  const testID = crypto.randomUUID();

  await setAuth({page, token});

  await createBoard({page, testID});

  await deleteBoard({page, testID});
});
