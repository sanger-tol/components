// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { createViewId, createZoneId } from '.';
import sql from '../../db';
import { createBoardId } from '.';
globalThis.crypto ??= require("node:crypto").webcrypto

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

const insertBoardToDB = async (userId: string, boardId: string) => {
  try {
    const viewID = createViewId();
    const zoneID = createZoneId();
    await sql.unsafe(`
      INSERT INTO "board"
      VALUES ('${boardId}', '${boardId}', '{"and_":{}}', ${userId});
      INSERT INTO "view"
      VALUES ('${viewID}', '${randomInt()}', '{"and_":{}}', ${userId});
      INSERT INTO "view_board"
      VALUES (${randomInt()}, '1', '${viewID}', '${boardId}');
      INSERT INTO "zone"
      VALUES ('${zoneID}', '${randomInt()}', 'curation', '{"and_":{}}', ${userId}, 'tol_production');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '1', '${zoneID}', '${viewID}');
    `).simple();
  }
  catch (e) {
    console.log(e)
  };

};

export const setBoard = async ({ page, boardID: boardId }) => {

  const user = await page.evaluate(() => {
    return localStorage.getItem('user');
  });
  const userID = JSON.parse(user).id;
  await insertBoardToDB(userID, boardId);
  await page.goto(`/board/${boardId}`);
  await page.getByTestId("board-enter-edit-mode-button").waitFor({ state: "visible" });
};

export const createBoardForUser = async (userId: string) => {
  const boardId = createBoardId();
  await insertBoardToDB(userId, boardId);
  return boardId;
}