/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta, IComponentConfig } from "..";

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

export interface IConfigDifferences {
  /**
   * Columns that will be added to the table configuration.
   * Represented as a `AttributeTitle` element or similar to allow for display of the column name with its source colour.
   */
  add: React.ReactNode[];
  /**
   * Columns that will be removed from the table configuration.
   * Represented as a `AttributeTitle` element or similar to allow for display of the column name with its source colour.
   */
  remove: React.ReactNode[];
}

export interface IDiffState {
  /**
   * Differences between the current and default table configuration,
   * used to inform the user of what changes will be made if they choose to reset their configuration.
   */
  configDifferences: IConfigDifferences;
  /**
   * Whether there are any differences between the current and default table configuration.
   */
  hasDiff: boolean;
  /**
   * The current table configuration, used to determine what the differences are with the default configuration.
   * This is required in order to show the user what changes will be made if they choose to reset their configuration.
   */
  currentConfig: Partial<ITableConfigSave> | null;
  /**
   * Whether the stored diff is identical to the base config and can be safely deleted.
   */
  isRedundantDiff?: boolean;
}

export interface ITableConfigSave extends ITableDrawerSave, ITableOtherSave {}

export type TCellHeights = Record<string, Record<string, number>>;

export type TFieldDropdownChoices = IFieldDropdownChoices[];

export type IFieldDropdownChoices = "copyValues";
