// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

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

// TODO: Add when required
// export interface ICreateViewInBoard {}

export interface ICreateZoneInView {
  userId: string;
  viewId: string;
  objectType: string;
  datasourceInstanceId?: string;
  title?: string;
  filter?: object;
  order?: number;
}

export interface ICreateComponentInZone {
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

export interface ICreateBoardOptional extends Partial<ICreateBoard> { }

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
