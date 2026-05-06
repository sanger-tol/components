// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { URL_PATHS } from '../../../../tol-ui/src';
import sql from '../../db';
globalThis.crypto ??= require("node:crypto").webcrypto

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

const insertBoardToDB = async (userID: string, boardID: string) => {
  // insert the admin role if not there already
  try {
    const zoneID = randomInt();
    const viewID = randomInt();
    await sql.unsafe(`
      INSERT INTO "board"
      VALUES ('${boardID}', '${boardID}', '{"and_":{}}', ${userID});
      INSERT INTO "view"
      VALUES (${viewID}, '${randomInt()}', '{"and_":{}}', ${userID});
      INSERT INTO "view_board"
      VALUES (${randomInt()}, '1', ${viewID}, '${boardID}');
      INSERT INTO "zone"
      VALUES (${zoneID}, '${randomInt()}', 'curation', '{"and_":{}}', ${userID}, 'tol_production');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '1', ${zoneID}, ${viewID});
    `).simple();
    return boardID;
  }
  catch (e) {
    console.log(e)
  };

};

export const setBoard = async ({ page, boardID }) => {

  const user = await page.evaluate(() => {
    return localStorage.getItem('user');
  });
  const userID = JSON.parse(user).id;
  const boardId = await insertBoardToDB(userID, boardID);
  await page.goto(`${URL_PATHS.BOARD}/${boardId}`);
  await page.getByTestId("board-enter-edit-mode-button").waitFor({ state: "visible" });
};