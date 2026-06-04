/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, MutableRefObject, SetStateAction } from "react";
import {
  FieldMeta,
  IComponent,
  IComponentConfig,
  IZone,
  TsDataSource,
} from "..";

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

export interface ITableConfigHandlerContext {
  /**
   * The unique identifier for the table component.
   */
  id: string;
  /**
   * The zone in which the table component is located.
   */
  zone: IZone;
  /**
   * The data source used by the table component.
   */
  boardDataSource: TsDataSource;
  /**
   * Whether the table component is in edit mode.
   */
  editMode: boolean;
  /**
   * Whether the user is logged in.
   */
  isLoggedIn: boolean;
  /**
   * The ID of the logged-in user, if applicable.
   */
  userId?: string;
  /**
   * The base configuration of the table component.
   */
  baseConfig: Partial<ITableConfigSave> | null | undefined;
  /**
   * The data of the table component.
   */
  componentData: IComponent;
  /**
   * A reference to the current diff state of the table component.
   */
  diffStateRef: MutableRefObject<IDiffState>;
  /**
   * A function to update the diff state of the table component.
   */
  setDiffState: Dispatch<SetStateAction<IDiffState>>;
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
