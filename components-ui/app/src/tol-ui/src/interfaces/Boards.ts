/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  IFilter,
  PUtilityBar,
  BOARD_CHILDREN_KEYS,
} from '..';

export interface IBoardEntity {
  id?: string;
  type?: string;
  title?: string;
}

export interface IBoardParentEntity<TChild> extends IBoardEntity {
  children: Record<string, TChild>;
  order: string[];
}

export interface IBoardFilter {
  filter?: IFilter;
  defaultFilter?: IFilter;
}

export interface IComponent extends IBoardEntity, IBoardFilter {
  subFilter?: IFilter;
  filterPassThrough?: boolean;
  componentType?: string;
  componentSize?: string;

  /**
   * Note: Not required for dev pages when using useZone
   */
  objectType?: string;
  dataspace?: TsDataSource;
  config?: any;
}

export interface IZone extends IBoardParentEntity<IComponent>, IBoardFilter {
  /**
   * The object type of the zone
   * All components in a zone use this object type
   */
  objectType?: string;
  /**
   * The user ID of the board owner, used to determine permissions for editing the board.
   * Note: Not required for dev pages when using useZone
   */
  dataspace?: TsDataSource;
}

export interface IView extends IBoardParentEntity<IZone> { }

export interface IBoard extends IBoardParentEntity<IView> {
  /**
   * The user ID of the board owner, used to determine permissions for editing the board.
   */
  ownerUserId?: string;
}

/**
 * Example of the board interface
 * 
 * IBoard → IView → IZone → IComponent
 * 
 * {
 *   id: "b_1",
 *   type: "board",
 *   title: "My Board",
 *   ownerUserId: "29",
 *   order: ["v_1"],
 *   children: {
 *     "v_1": {
 *       id: "v_1",
 *       type: "view",
 *       title: "Main View",
 *       order: ["z_1"],
 *       children: {
 *         "z_1": {
 *           id: "z_1",
 *           type: "zone",
 *           title: "Species Zone",
 *           objectType: "species",
 *           filter: { and_: {} },
 *           order: ["c_1", "c_2"],
 *           children: {
 *             "c_1": {
 *               id: "c_1",
 *               type: "component",
 *               title: "Species Table",
 *               componentType: "table",
 *               componentSize: "lg",
 *               filter: { and_: {} },
 *               config: {},
 *             },
 *             "c_2": {
 *               id: "c_2",
 *               type: "component",
 *               title: "Species Chart",
 *               componentType: "chart",
 *               componentSize: "md",
 *               filter: { and_: {} },
 *               config: {},
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 */

export interface IRemoteTarget {
  /**
   * Object type name used when fetching data from the dataSource
   */
  objectType: string;
  /**
   * Data source for executing API requests
   */
  dataSource: TsDataSource;
}

export interface IZoneControl {
  /**
   * The current filter zone
   */
  zone: IZone;
  /**
   * Setter used to update the zone when configuration changes reset downstream filters 
   */
  setZone: (zone: IZone) => void;
}

export interface IRemoteTargetAndZone extends IRemoteTarget, IZoneControl { }

export interface IBoardTarget {
  boardObjectType: string;
  boardDataSource: TsDataSource;
}

export interface IBoardTargetAndZone extends IRemoteTargetAndZone, IBoardTarget { }

export type TUtilityBarOrNull = PUtilityBar | null;

export interface IUseZoneMeta {
  objectType: string;
  dataSource: TsDataSource;
  zone: IZone;
  setZone: (zone: IZone) => void;
}

export type TChildrenKey = (typeof BOARD_CHILDREN_KEYS)[keyof typeof BOARD_CHILDREN_KEYS];

export interface IDBDataSourceInstanceApiDetails {
  url: string;
  apiPath: string;
  apiDataPath: string;
  dataspace: string;
}

export interface IBoardParam {
  /**
   * The field name in the joining table that references the parent entity (e.g. 'view_id').
   */
  parentIdField: string;
  /**
   * The object type of the parent entity (e.g. 'view').
   */
  parentObjectType: string;
  /**
   * The relationship name to fetch the parent entity from the joining table entries (e.g. 'view' in zone_view).
   */
  parentRelationship: string;
  /**
   * The type of the joining table entries (e.g. 'zone_view').
   */
  joiningObjectType: string;
  /**
   * The field name in the joining table that references the child entity (e.g. 'zone_id').
   */
  childIdField: string;
  /**
  * The object type of the child entity (e.g. 'zone').
  */
  childObjectType: string;
  /**
   * The relationship name to fetch the child entity from the joining table entries (e.g. 'zone' in zone_view).
   */
  childRelationship: string;
  /**
   * The initialised key for the children entities on the board state (e.g. 'zones' for a view).
   */
  childrenKey: string;
  /**
   * Optional array to fetch specific fields from the joining object type.
   */
  joiningObjectRequestedFields: string[];
}

export type TBoardParams = Record<string, IBoardParam>;
