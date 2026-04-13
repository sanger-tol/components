/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta } from "..";

export interface ITableDrawerSave {
  fieldMeta?: FieldMeta;
  actions?: string[];
  defaultSortByAttribute?: string;
  defaultSortByType?: string;
  editMode?: boolean;
}

export interface ITableOtherSave {
  filterVisibility?: boolean;
  pageSize?: number;
}

export interface ITableConfigSave extends ITableDrawerSave, ITableOtherSave {}

export type TCellHeights = Record<string, Record<string, number>>;

export type TFieldDropdownChoices = IFieldDropdownChoices[];

export type IFieldDropdownChoices = "copyValues";
