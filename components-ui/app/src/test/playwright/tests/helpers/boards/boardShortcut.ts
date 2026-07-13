// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import sql from "../../../db";
globalThis.crypto ??= require("node:crypto").webcrypto

import { createBoardId, createViewId, createZoneId, createComponentId } from ".";

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

const insertBoardToDB = async (
  userId: string,
  boardId: string,
  viewID: string = createViewId(),
  zoneID: string = createZoneId()
) => {
  try {
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

/**
 * Creates a board using the given id and navigates to it
 * @param page The Playwright page handle
 * @param boardId The ID to give this new board
 */
export const setBoard = async (page, boardId) => {
  const user = await page.evaluate(() => {
    return localStorage.getItem("user");
  });
  const userId = JSON.parse(user).id;
  await insertBoardToDB(userId, boardId);
  await page.goto(`/board/${boardId}`);
  await page.getByTestId("board-enter-edit-mode-button").waitFor({ state: "visible" });
};

/**
 * Adds a new board into the database for the given user ID
 * @param userId The ID of the owner user of this new board
 */
export const createBoardForUser = async (userId: string) => {
  const boardId = createBoardId();
  const viewId = createViewId();
  const zoneId = createZoneId();
  await insertBoardToDB(userId, boardId, viewId, zoneId);
  return {boardId, viewId, zoneId};
}

/**
 * Inserts a component into the database for the given user ID and zone ID
 * @param userId The ID of the owner user of this new component
 * @param componentTitle The title of the new component
 * @param zoneId The ID of the zone to insert this component into
 * @param componentType The type of the new component (default: "table")
 * @param datasourceInstanceId The ID of the datasource instance to use (default: "tol_production")
 * @param filter The filter object for the new component (default: {})
 * @param config The config object for the new component (default: {})
 * @param widgetType The widget type for the new component (default: "lg")
 * @param objectType The object type for the new component (default: "curation")
 */
export const InsertComponentToBoard = async (
  userId: string,
  componentTitle: string,
  zoneId: string,
  componentType: string = "table",
  datasourceInstanceId: string = "tol_production",
  filter: object = {},
  config: object = {},
  widgetType: string = "lg",
  objectType: string = "curation",
) => {
  try {
    const componentId = createComponentId();
    await sql.unsafe(`
      INSERT INTO "component"
      VALUES (
        '${componentId}',
        '${componentTitle}',
        '${objectType}',
        '${componentType}',
        '${widgetType}',
        '${JSON.stringify(config)}',
        '${JSON.stringify(filter)}',
        ${userId},
        false,
        '${datasourceInstanceId}'
      );
      INSERT INTO "component_zone"
      VALUES (${randomInt()}, '1', '${componentId}', '${zoneId}');
    `).simple();
  }
  catch (e) {
    console.log(e)
  };
}

