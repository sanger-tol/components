// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import sql from '../../db';

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

const insertAuthToDB = async ({userID, token, orcidID}) => {
  // insert the admin role if not there already
  try {
    await sql.unsafe(`INSERT INTO "role" VALUES (1, 'admin');`).simple();
  }
  catch (e) {};

  // insert the rest
  await sql.unsafe(`INSERT INTO "user"
  VALUES (${userID}, '${orcidID}');
  
  INSERT INTO role_binding
  VALUES (${randomInt()}, ${userID}, 1);
  
  INSERT INTO "token"
  VALUES (${randomInt()}, '${token}', NOW(), NOW() + INTERVAL '1 YEAR', ${userID});`).simple();    
};

export const setAuth = async ({page}) => {
  const userID = randomInt();
  const token = crypto.randomUUID();
  const orcidID = `https://orcid.org/${crypto.randomUUID()}`;

  await insertAuthToDB({userID, token, orcidID});
 
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