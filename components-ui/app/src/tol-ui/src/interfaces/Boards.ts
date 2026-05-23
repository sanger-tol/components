/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource, BOARD_ENTITIES } from "..";
import type { FieldMeta, PUtilityBar, IFilter } from "..";

export interface TBoardEntity {
  id?: string;
  type?: TBoardEntityType;
  title?: string;
}

export type TBoardChildren<TChild> = Record<string, TChild>;

export interface IBoardParentEntity<TChild> extends TBoardEntity {
  children: TBoardChildren<TChild>;
  order: string[];
}

export interface IBoardFilter {
  filter?: IFilter;
  defaultFilter?: IFilter;
}

export interface IComponentConfig {
  fieldMeta: Partial<FieldMeta>;
}

export interface IComponent extends TBoardEntity, IBoardFilter {
  subFilter?: IFilter;
  filterPassThrough?: boolean;
  component_type?: string;
  widget_type?: string;

  /**
   * Note: Not required for dev pages when using useZone
   */
  object_type?: string;
  dataspace?: TsDataSource;
  config?: Partial<IComponentConfig>;
  config_diff?: { id: string; config: Partial<IComponentConfig> };
  data_source_instance_id?: string;
  ui_api_details: IDBDataSourceInstanceApiDetails;
}

export interface IZone extends IBoardParentEntity<IComponent>, IBoardFilter {
  /**
   * The object type of the zone
   * All components in a zone use this object type
   */
  object_type?: string;
  /**
   * The user ID of the board owner, used to determine permissions for editing the board.
   * Note: Not required for dev pages when using useZone
   */
  data_source_instance_id?: string;
  dataspace?: TsDataSource;
}

export interface IView extends IBoardParentEntity<IZone> {}

export interface IBoard extends IBoardParentEntity<IView> {
  /**
   * The user ID of the board owner, used to determine permissions for editing the board.
   */
  owner_email?: string;
  write_privilege?: boolean;
}

export type TBoardEntityType =
  (typeof BOARD_ENTITIES.ENTITIES)[keyof typeof BOARD_ENTITIES.ENTITIES];
export type TBoardParentEntityType = Exclude<
  TBoardEntityType,
  typeof BOARD_ENTITIES.ENTITIES.COMPONENT
>;
export type TBoardChildEntityType = Exclude<
  TBoardEntityType,
  typeof BOARD_ENTITIES.ENTITIES.BOARD
>;
export type TBoardJoiningEntityType =
  keyof typeof BOARD_ENTITIES.JOINING_ENTITIES;
export type TBoardAllEntityTypes = TBoardEntityType | TBoardJoiningEntityType;

/**
 * Example of the board interface
 *
 * IBoard → IView → IZone → IComponent
 *
 * {
 *   id: "b_1",
 *   type: "board",
 *   title: "My Board",
 *   owner_email: "example@example.com",
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
 *           object_type: "species",
 *           filter: { and_: {} },
 *           order: ["c_1", "c_2"],
 *           children: {
 *             "c_1": {
 *               id: "c_1",
 *               type: "component",
 *               title: "Species Table",
 *               component_type: "table",
 *               widget_type: "lg",
 *               filter: { and_: {} },
 *               config: {},
 *             },
 *             "c_2": {
 *               id: "c_2",
 *               type: "component",
 *               title: "Species Chart",
 *               component_type: "chart",
 *               widget_type: "md",
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

export interface IRemoteTargetAndZone extends IRemoteTarget, IZoneControl {}

export interface IBoardTarget {
  boardObjectType: string;
  boardDataSource: TsDataSource;
}

export interface IBoardTargetAndZone
  extends IRemoteTargetAndZone, IBoardTarget {}

export type TUtilityBarOrNull = PUtilityBar | null;

export interface IUseZoneMeta {
  objectType: string;
  dataSource: TsDataSource;
  zone: IZone;
  setZone: (zone: IZone) => void;
}

// export type TChildrenKey =
//   (typeof BOARD_CHILDREN_KEYS)[keyof typeof BOARD_CHILDREN_KEYS];

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
