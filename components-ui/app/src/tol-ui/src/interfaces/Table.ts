/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMeta } from "..";

export type ITableRecord = Record<string, any>;

export type ITableData = ITableRecord[];

export interface ITableDrawerSave {
  fieldMeta?: IFieldMeta;
  actions?: string[];
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
}

export interface ITableOtherSave {
  filterVisibility?: boolean;
  pageSize?: number;
}

export interface ITableConfigSave extends ITableDrawerSave, ITableOtherSave {}

export type TCellHeights = Record<string, Record<string, number>>;

export type TFieldDropdownChoices = IFieldDropdownChoices[];

export type IFieldDropdownChoices = "copyValues";
