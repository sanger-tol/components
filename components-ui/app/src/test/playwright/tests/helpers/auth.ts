// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from '@playwright/test';
import sql from '../../db';
globalThis.crypto ??= require("node:crypto").webcrypto

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

const insertAuthToDB = async (userId, token, orcidId) => {
  await sql.unsafe(`
    INSERT INTO "user" (id, oidc_id, name, email, workplace)
    VALUES (${userId}, '${orcidId}', 'Test User', '${userId}@example.com', 'Test Workplace');
    
    INSERT INTO role_binding
    VALUES (${randomInt()}, ${userId}, 2);
    
    INSERT INTO "token"
    VALUES (${randomInt()}, '${token}', NOW(), NOW() + INTERVAL '1 YEAR', ${userId});
  `).simple();
  };

/**
 * Sets up authentication for the account used in the tests on the browser.
 * Call this function before a test to create an authenticated session for the test user.
 * @param page The Playwright page handle
 */
export const setAuth = async (page: Page) => {
  const userID = randomInt();
  const token = crypto.randomUUID();
  const orcidID = `https://orcid.org/${crypto.randomUUID()}`;

  await insertAuthToDB(userID, token, orcidID);
 
  const storageData = {
    user: {
      "oidc_id": orcidID,
      "token_created_at": "2025-03-31T14:13:36.345558",
      "token_expires_at": "2090-04-07T14:13:36.345581",
      "id": userID,
      "roles": ["tol"],
    },
    "token": token,
  };

  await page.context().setExtraHTTPHeaders({
    "token": token,
  });

  await page.goto("/");

  await page.evaluate((data) => {
    Object.keys(data).forEach((key) => {
      localStorage.setItem(key, JSON.stringify(data[key]));
    });
  }, storageData);

  await page.reload();
  await page.waitForLoadState("load");
};

/**
 * Adds a user to the database and returns the user's credentials.
 * 
 * This function differs from setAuth in that it does not set up an authenticated
 * session for the user on the browser.
 * 
 * Use this function when you just want to add a user to the database without logging
 * in as that user in the test.
 */
export const addUserToDB = async () => {
  const userId = randomInt();
  const token = crypto.randomUUID();
  const orcidId = `https://orcid.org/${crypto.randomUUID()}`;

  await insertAuthToDB(userId, token, orcidId);
  return { userId, token, orcidId };
}
