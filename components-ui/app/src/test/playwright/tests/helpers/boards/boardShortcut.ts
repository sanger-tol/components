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
  boardTitle?: string;
  viewId?: string;
  viewTitle?: string;
  zoneId?: string;
  zoneTitle?: string;
  zoneObjectType?: string;
}

export interface ICreateBoardReturn extends ICreateBoard {
  boardId: string;
  boardTitle: string;
}

export interface ICreateBoardAndViewReturn extends ICreateBoardReturn {
  viewId: string;
  viewTitle: string;
}

export interface ICreateBoardAndViewAndZoneReturn extends ICreateBoardAndViewReturn {
  zoneId: string;
  zoneTitle: string;
  zoneObjectType: string;
}

export interface ICreateBoardOptional extends Partial<ICreateBoard> { }

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
    `

    if (viewId) {
      query += `
        INSERT INTO "view"
        VALUES ('${viewId}', '${viewTitle}', '{"and_":{}}', ${userId});
        INSERT INTO "view_board"
        VALUES (${randomInt()}, '1', '${viewId}', '${boardId}');
      `
    }

    if (viewId && zoneId && zoneObjectType) {
      query += `
      INSERT INTO "zone"
      VALUES ('${zoneId}', '${zoneTitle}', '${zoneObjectType}', '{"and_":{}}', ${userId}, '${DATASOURCE_INSTANCE_ID}');
      INSERT INTO "zone_view"
      VALUES (${randomInt()}, '1', '${zoneId}', '${viewId}');
      `
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

export async function createBoard(params: ICreateBoard): Promise<ICreateBoardReturn> {
  return await insertBoardToDB(params);
}

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

export const insertComponentInBoard = async ({
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

export const insertZoneInBoard = async ({
  userId,
  viewId,
  title = 'Test Zone',
  objectType = OBJECT_TYPE,
  filter = {},
  order = 1,
  datasourceInstanceId = DATASOURCE_INSTANCE_ID,
}: IInsertZoneToBoard) => {
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
