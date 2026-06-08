// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { createViewID, createZoneID } from '.';
import sql from '../../db';
import { createBoardID } from '.';
globalThis.crypto ??= require("node:crypto").webcrypto

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

const insertBoardToDB = async (userID: string, boardID: string) => {
  try {
    const viewID = createViewID();
    const zoneID = createZoneID();
    await sql.unsafe(`
      INSERT INTO "board"
      VALUES ('${boardID}', '${boardID}', '{"and_":{}}', ${userID});
      INSERT INTO "view"
      VALUES ('${viewID}', '${randomInt()}', '{"and_":{}}', ${userID});
      INSERT INTO "view_board"
      VALUES (${randomInt()}, '1', '${viewID}', '${boardID}');
      INSERT INTO "zone"
      VALUES ('${zoneID}', '${randomInt()}', 'curation', '{"and_":{}}', ${userID}, 'tol_production');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '1', '${zoneID}', '${viewID}');
    `).simple();
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
  await insertBoardToDB(userID, boardID);
  await page.goto(`/board/${boardID}`);
  await page.getByTestId("board-enter-edit-mode-button").waitFor({ state: "visible" });
};

export const createBoardForUser = async (userID: string) => {
  const boardID = createBoardID();
  await insertBoardToDB(userID, boardID);
  return boardID;
}