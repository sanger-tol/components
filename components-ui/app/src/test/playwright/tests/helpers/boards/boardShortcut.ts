// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import sql from "../../../db";
globalThis.crypto ??= require("node:crypto").webcrypto
import { createBoardId, createViewId, createZoneId, createComponentId } from ".";
import { DATASOURCE_INSTANCE_ID, OBJECT_TYPE, randomInt } from "../..";
import type { Page } from "@playwright/test";
import type {
  ICreateBoardReturn,
  ICreateBoardAndViewReturn,
  ICreateBoardAndViewAndZoneReturn,
  ICreateBoard,
  ICreateBoardOptional,
  ICreateZoneInView,
  ICreateComponentInZone,
} from "../../interfaces/board";


/**
 * Inserts a board and, when configured, its view and zone into the database.
 * @param params The board, view, and zone values to insert if provided
 * @returns The identifiers and values used to create the board hierarchy
 */
async function insertBoardToDB({
  userId,
  boardId = createBoardId(),
  boardTitle = "Test Board",
  viewId,
  viewTitle,
  zoneId,
  zoneTitle,
  zoneObjectType,
}: ICreateBoard): Promise<ICreateBoardReturn> {
  try {
    let query = `
      INSERT INTO "board"
      VALUES ('${boardId}', '${boardTitle}', '{"and_":{}}', ${userId});
    `;

    if (viewId) {
      query += `
        INSERT INTO "view"
        VALUES ('${viewId}', '${viewTitle}', '{"and_":{}}', ${userId});
        INSERT INTO "view_board"
        VALUES (${randomInt()}, '1', '${viewId}', '${boardId}');
      `;
    }

    if (viewId && zoneId && zoneObjectType) {
      query += `
      INSERT INTO "zone"
      VALUES ('${zoneId}', '${zoneTitle}', '${zoneObjectType}', '{"and_":{}}', ${userId}, '${DATASOURCE_INSTANCE_ID}');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '1', '${zoneId}', '${viewId}');
      `;
    }

    await sql.unsafe(query).simple();
  } catch (e) {
    console.log(e)
  };
  return {
    userId,
    boardId,
    viewId,
    zoneId,
    boardTitle,
    viewTitle,
    zoneTitle,
    zoneObjectType,
  };
};

/**
 * Creates a board directly in the database.
 * @param params The board values to insert
 * @returns The identifiers and values used to create the board
 */
export async function createBoard(params: ICreateBoard): Promise<ICreateBoardReturn> {
  return await insertBoardToDB(params);
}

/**
 * Creates a board and an associated view directly in the database.
 * @param params The board and optional view values to insert
 * @returns The identifiers and values used to create the board and view
 */
export async function createBoardAndView(params: ICreateBoard): Promise<ICreateBoardAndViewReturn> {
  const viewId = params.viewId || createViewId();
  const viewTitle = params.viewTitle ?? "Test View";
  const board = await createBoard({
    ...params,
    viewId,
    viewTitle,
  });
  return { ...board, viewId, viewTitle };
}

/**
 * Creates a board, an associated view, and a zone directly in the database.
 * @param params The board and optional view and zone values to insert
 * @returns The identifiers and values used to create the board, view, and zone
 */
export async function createBoardAndViewAndZone(
  params: ICreateBoard
): Promise<ICreateBoardAndViewAndZoneReturn> {
  const zoneId = params.zoneId || createZoneId();
  const zoneTitle = params.zoneTitle ?? "Test Zone";
  const zoneObjectType = params.zoneObjectType || OBJECT_TYPE;
  const board = await createBoardAndView({
    ...params,
    zoneId,
    zoneTitle,
    zoneObjectType,
  });
  return { ...board, zoneId, zoneTitle, zoneObjectType };
}

/**
 * Creates a populated board for the authenticated user and navigates to it.
 * Waits until the board is ready to enter edit mode before returning.
 * @param page The Playwright page handle containing the authenticated user
 * @param params Optional values used to create the board, view, and zone
 * @returns The identifiers and values used to create the board, view, and zone
 */
export async function createPopulatedBoardAndGoToPage(page: Page, params: ICreateBoardOptional = {}) {
  const user = await page.evaluate(() => {
    return localStorage.getItem("user");
  });
  const userId = JSON.parse(user!).id;

  const boardParams = await createBoardAndViewAndZone({ ...params as ICreateBoard, userId });
  await page.goto(`/board/${boardParams.boardId}`);
  await page.getByTestId("board-enter-edit-mode-button").waitFor({ state: "visible" });
  return boardParams;
};

/**
 * Creates a component directly in the database and associates it with a zone.
 * @param params The component values and target zone
 * @returns A promise that resolves when the component has been created
 */
export const createComponentInZone = async ({
  userId,
  componentTitle,
  zoneId,
  componentType = "table",
  datasourceInstanceId = DATASOURCE_INSTANCE_ID,
  filter = {},
  config = {},
  widgetType = "lg",
  objectType = OBJECT_TYPE,
  order = 1,
}: ICreateComponentInZone) => {
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

/**
 * Creates a zone directly in the database and associates it with a view.
 * @param params The zone values and target view
 * @returns The created zone ID, or undefined if the database operation fails
 */
export const createZoneInView = async ({
  userId,
  viewId,
  title = 'Test Zone',
  objectType = OBJECT_TYPE,
  filter = {},
  order = 1,
  datasourceInstanceId = DATASOURCE_INSTANCE_ID,
}: ICreateZoneInView) => {
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
