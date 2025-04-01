// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect } from '@playwright/test';

import sql from '../db';
import { test } from '../fixtures';

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({headless: headless});

const setAuth = async ({page, token}) => {
  const storageData = {
    user: {
      "oidc_id": "https://orcid.org/0000-0000-0000-0000",
      "token_created_at":"2025-03-31T14:13:36.345558",
      "token_expires_at":"2090-04-07T14:13:36.345581",
      "id":"1000021",
      "roles":[]
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
    VALUES (1000021, 'https://orcid.org/0000-0000-0000-0000');
    
    INSERT INTO role_binding
    VALUES (83489247, 1000021, 1);
    
    INSERT INTO "token"
    VALUES (3498237, '${token}', NOW(), NOW() + INTERVAL '1 YEAR', 1000021);`).simple();    
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
};

test('manage dashboard', async ({ page, token }) => {
  const testID = crypto.randomUUID();

  await setAuth({page, token});

  await createBoard({page, testID});

  await page.waitForTimeout(3000);
});
