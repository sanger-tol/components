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
    profile: {
      email: "example.user@sanger.ac.uk",
      fullName: "Example User",
      userId: 1000021
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
    VALUES (1000021, 'example.user@sanger.ac.uk', 'example.user@sanger.ac.uk', 'Example User', NOW(), NOW(), 'elixirID', TRUE, 'Example', 'User', '{}'::JSONB, NOW(), FALSE, '', FALSE);
    
    INSERT INTO role_binding
    VALUES (83489247, 1000021, 1);
    
    INSERT INTO "token"
    VALUES ('${token}', 1000021, NOW(), NOW() + INTERVAL '1 YEAR');`).simple();    
  }
  catch (e) {
  };
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
