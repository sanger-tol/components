// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import sql from "../../../db";
globalThis.crypto ??= require("node:crypto").webcrypto

import { createBoardId, createViewId, createZoneId, createComponentId } from ".";
import { DATASOURCE_INSTANCE_ID, OBJECT_TYPE } from "../../constants/board";
import { Page } from "@playwright/test";

const randomInt = () => Math.floor(Math.random() * 2_000_000_000);

export interface ICreateBoard {
  userId: string;
  boardId?: string;
  viewId?: string;
  zoneId?: string;
  boardTitle?: string;
  viewTitle?: string;
  zoneTitle?: string;
  zoneObjectType?: string;
}

export interface ICreateBoardOptional extends Partial<ICreateBoard> {}

export interface IInsertZoneToBoard {
  userId: string;
  viewId: string;
  objectType: string;
  datasourceInstanceId?: string;
  title?: string;
  filter?: object;
  order?: number;
}

export interface IInsertComponentToBoard {
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

async function insertBoardToDB({
  userId,
  boardId = createBoardId(),
  viewId = createViewId(),
  zoneId = createZoneId(),
  boardTitle = "Test Board",
  viewTitle,
  zoneTitle,
  zoneObjectType,
}: ICreateBoard) {
  try {
    const query = `
      INSERT INTO "board"
      VALUES ('${boardId}', '${boardTitle}', '{"and_":{}}', ${userId});
      INSERT INTO "view"
      VALUES ('${viewId}', '${viewTitle}', '{"and_":{}}', ${userId});
      INSERT INTO "view_board"
      VALUES (${randomInt()}, '1', '${viewId}', '${boardId}');
    `
    if (zoneObjectType) {
      await sql.unsafe(`
      ${query}
      INSERT INTO "zone"
      VALUES ('${zoneId}', '${zoneTitle}', '${zoneObjectType}', '{"and_":{}}', ${userId}, '${DATASOURCE_INSTANCE_ID}');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '1', '${zoneId}', '${viewId}');
    `).simple();
    } else {
      await sql.unsafe(`
      ${query}
    `).simple();
    }
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
  } as ICreateBoard;
};

export async function createPopulatedBoardAndGoToPage(page: Page, params: ICreateBoardOptional = {}) {
  const user = await page.evaluate(() => {
    return localStorage.getItem("user");
  });
  const userId = JSON.parse(user!).id;

  const boardParams = await insertBoardToDB({ ...params as ICreateBoard, userId });
  await page.goto(`/board/${boardParams.boardId}`);
  await page.getByTestId("board-enter-edit-mode-button").waitFor({ state: "visible" });
  return boardParams;
};

export async function createBoard(params: ICreateBoard) {
  return await insertBoardToDB(params);
}

export async function createBoardAndView(params: ICreateBoard) {
  return await createBoard({
    ...params,
    viewId: params.viewId || createViewId(),
  });
}

export async function createBoardAndViewAndZone(params: ICreateBoard) {
  return await createBoardAndView({
    ...params,
    zoneId: params.zoneId || createZoneId(),
  });
}


/**
 * Inserts a component into the database for the given user ID and zone ID
 */
export const insertComponentToBoard = async ({
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
}: IInsertComponentToBoard) => {
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
    objectType = OBJECT_TYPE,
    filter = {},
    order = 1,
    datasourceInstanceId = DATASOURCE_INSTANCE_ID,
  }: IInsertZoneToBoard
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
