// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import sql from "../../../db";
globalThis.crypto ??= require("node:crypto").webcrypto

import { createBoardId, createViewId, createZoneId, createComponentId } from ".";

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

export interface InsertComponentToBoardOptions {
  userId: string;
  componentTitle: string;
  zoneId: string;
  componentType?: string;
  datasourceInstanceId?: string;
  filter?: object;
  config?: object;
  widgetType?: string;
  objectType?: string;
  order?: number;
}

export interface InsertZoneToBoardOptions {
  userId: string;
  viewId: string;
  objectType: string;
  datasourceInstanceId?: string;
  title?: string;
  filter?: object;
  order?: number;
}

export interface createBoardForUserOptions {
  userId: string;
  viewTitle?: string;
  zoneTitle?: string;
  boardTitle?: string;
  zoneObjectType?: string;
}

const insertBoardToDB = async (
  userId: string,
  boardId: string,
  viewID: string = createViewId(),
  zoneID: string = createZoneId(),
  viewTitle: string,
  zoneTitle: string,
  boardTitle: string,
  zoneObjectType: string,
) => {
  try {
    await sql.unsafe(`
      INSERT INTO "board"
      VALUES ('${boardId}', '${boardTitle}', '{"and_":{}}', ${userId});
      INSERT INTO "view"
      VALUES ('${viewID}', '${viewTitle}', '{"and_":{}}', ${userId});
      INSERT INTO "view_board"
      VALUES (${randomInt()}, '1', '${viewID}', '${boardId}');
      INSERT INTO "zone"
      VALUES ('${zoneID}', '${zoneTitle}', '${zoneObjectType}', '{"and_":{}}', ${userId}, 'tol_production');
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
export const createBoardForUser = async (
  {
    userId,
    viewTitle = `${randomInt()}`,
    zoneTitle = `${randomInt()}`,
    boardTitle = `${randomInt()}`,
    zoneObjectType = "curation",
  }: createBoardForUserOptions
) => {
  const boardId = createBoardId();
  const viewId = createViewId();
  const zoneId = createZoneId();
  await insertBoardToDB(
    userId,
    boardId,
    viewId,
    zoneId,
    viewTitle,
    zoneTitle,
    boardTitle,
    zoneObjectType
  );
  return {boardId, viewId, zoneId};
}

/**
 * Inserts a component into the database for the given user ID and zone ID
 */
export const insertComponentToBoard = async (
  {
    userId,
    componentTitle,
    zoneId,
    componentType = "table",
    datasourceInstanceId = "tol_production",
    filter = {},
    config = {},
    widgetType = "lg",
    objectType = "curation",
    order = 1,
  }: InsertComponentToBoardOptions
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
      VALUES (${randomInt()}, '${order}', '${componentId}', '${zoneId}');
    `).simple();
  }
  catch (e) {
    console.log(e)
  };
}

export const insertZoneToBoard = async (
  {
    userId,
    viewId,
    title = 'Test Zone',
    objectType = "curation",
    filter = {},
    order = 1,
    datasourceInstanceId = "tol_production",
  }: InsertZoneToBoardOptions
) => {
  try {
    const zoneId = createZoneId();
    await sql.unsafe(`
      INSERT INTO "zone"
      VALUES ('${zoneId}', '${title}', '${objectType}', '${JSON.stringify(filter)}', ${userId}, '${datasourceInstanceId}');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '${order}', '${zoneId}', '${viewId}');
    `).simple();
    return zoneId;
  }
  catch (e) {
    console.log(e)
  };
}

