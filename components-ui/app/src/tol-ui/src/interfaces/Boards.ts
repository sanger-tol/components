/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource, BOARD_ENTITIES } from "..";
import type { IFieldMeta, PUtilityBar, IFilter, TComponentType, TTranslations } from "..";

export interface TBoardEntityCore {
  /**
   * The unique identifier for a board entity.
   */
  id: string;
  /**
   * The type of the board entity e.g. "component"
   */
  type?: TBoardEntityType;
  /**
   * The title of the board entity, used for display purposes.
   */
  title?: string;
}

export type TBoardChildren<TChild> = Record<string, TChild>;

export interface IBoardParentEntity<TChild> extends TBoardEntityCore {
  /**
   * The child entities of a board entity
   */
  children: TBoardChildren<TChild>;
  /**
   * The order of child entities, used to determine the display order of children.
   */
  order: string[];
}

export interface IBoardFilter {
  /**
   * The filter directly related to this entity.
   */
  filter?: IFilter;
  /**
   * The default filter for this entity, used to reset the filter to its original state.
   */
  defaultFilter?: IFilter;
  /**
   * Whether the filter should be passed through to child entities.
   * If true, the filter will not be applied to child entities.
   */
  filterExcludeIncoming?: boolean;
  /**
   * Whether this entity's filter applies only to itself.
   * If true, the filter does not affect other entities in the hierarchy.
   */
  filterPassThrough?: boolean;
}

export interface IComponentConfig {
  fieldMeta: Partial<IFieldMeta>;
}

export interface IComponent extends TBoardEntityCore, IBoardFilter {
  subFilter?: IFilter;
  component_type?: TComponentType;
  widget_type?: string;

  /**
   * Note: Not required for dev pages when using useZone
   */
  object_type?: string;
  dataspace?: TsDataSource;
  config?: Partial<IComponentConfig>;
  config_diff?: { id: string; config: Partial<IComponentConfig> };
  data_source_instance_id?: string;
  ui_api_details?: IDBDataSourceInstanceApiDetails;
}

export interface IZone extends IBoardParentEntity<IComponent>, IBoardFilter {
  /**
   * The object type of the zone
   */
  object_type?: string;
  /**
   * The user ID of the board owner, used to determine permissions for editing the board.
   */
  data_source_instance_id?: string;
  /**
   * The data source instance for the zone, used to fetch data for the zone and its components.
   */
  dataspace?: TsDataSource;
  /**
   * The API details for the data source instance, used to fetch data for the zone and its components.
   */
  ui_api_details?: IDBDataSourceInstanceApiDetails;
  /**
   * Custom translations for specific attributes
   */
  attributeTranslations?: TTranslations;
  /**
   * Custom translations for specific relationships
   */
  relationshipTranslations?: TTranslations;
  /**
   * Whether to use automatic translations where possible
   */
  autoTranslations?: boolean;
}

export interface IView extends IBoardParentEntity<IZone> {}

export interface IBoard extends IBoardParentEntity<IView> {
  /**
   * The user ID of the board owner, used to determine permissions for editing the board.
   */
  owner_email?: string;
  write_privilege?: boolean;
}

/**
 * The hierarchy of board entities, used to derive object types and for type checking.
 */
export type TBoardEntity = IBoard | IView | IZone | IComponent;

/**
 * Possible parent entity types.
 */
export type TParentBoardEntity = IBoard | IView | IZone;

/**
 * Possible child entity types.
 */
export type TChildBoardEntity = IView | IZone | IComponent;

export type TBoardEntityType =
  (typeof BOARD_ENTITIES.ENTITIES)[keyof typeof BOARD_ENTITIES.ENTITIES];

/**
 * Example of the board interface.
 *
 * IBoard → IView → IZone → IComponent
 *
 * {
 *   id: "b_1",
 *   type: "board",
 *   title: "My Board",
 *   owner_email: "example@mail.com",
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

export interface IDBDataSourceInstanceApiDetails {
  url: string;
  apiPath: string;
  apiDataPath: string;
  dataspace: string;
}
