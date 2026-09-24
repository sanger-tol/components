/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource, BOARD_ENTITIES } from "..";
import type { IFieldMeta, PUtilityBar, IFilter, TComponentType, TTranslations } from "..";

/** Core metadata shared by all board entities. */
export interface TBoardEntityCore extends IBoardFilter {
  /** Unique identifier for a board entity. */
  id: string;
  /** Type of the board entity, for example "component". */
  type?: TBoardEntityType;
  /** Display title for the board entity. */
  title?: string;
}

/** Mapping of child entity identifiers to child entities. */
export type TBoardChildren<TChild> = Record<string, TChild>;

/** Parent entity data for nested board structures. */
export interface IBoardParentEntity<TChild> extends TBoardEntityCore {
  /** Child entities belonging to this board entity. */
  children: TBoardChildren<TChild>;
  /** Display order of the child entities. */
  order: string[];
}

/** Base interface for board filters. */
export interface IBoardFilter {
  /** The underlying object type, for example "species". */
  object_type?: string;
  /** Filter directly related to this entity. */
  filter?: IFilter;
}

/** Filter metadata for hierarchical board structures. */
export interface IBoardFilterHierarchy extends IBoardFilter {
  /** Default filter used to reset this entity to its original state. */
  defaultFilter?: IFilter;
  /** Whether the filter should be passed through to child entities. */
  filterExcludeIncoming?: boolean;
  /** Whether this entity's filter applies only to itself. */
  filterPassThrough?: boolean;
}

/** Configuration metadata for a component. */
export interface IComponentConfig {
  /** Field metadata used to configure the component UI. */
  fieldMeta: Partial<IFieldMeta>;
}

/** A board component rendered in a zone. */
export interface IComponent extends TBoardEntityCore, IBoardFilterHierarchy {
  /** Optional filter applied on top of the component's base filter. */
  subFilter?: IFilter;
  /** Concrete component type. */
  component_type?: TComponentType;
  /** Visual widget type used to render the component. */
  widget_type?: string;
  /** Data source instance used by the component when not supplied via a zone. */
  dataspace?: TsDataSource;
  /** Optional configuration for the component. */
  config?: Partial<IComponentConfig>;
  /** Config diff payload used to update a component's configuration. */
  config_diff?: { id: string; config: Partial<IComponentConfig> };
  /** Identifier for the underlying data source instance. */
  data_source_instance_id?: string;
  /** API details for the component's data source. */
  ui_api_details?: IDBDataSourceInstanceApiDetails;
}

/** A grouping container for components within a view. */
export interface IZone extends IBoardParentEntity<IComponent>, IBoardFilterHierarchy {
  /** Identifier for the data source instance backing the zone. */
  data_source_instance_id?: string;
  /** Data source instance used to fetch data for the zone and its components. */
  dataspace?: TsDataSource;
  /** API details for the zone's data source instance. */
  ui_api_details?: IDBDataSourceInstanceApiDetails;
  /** Whether automatic relationship translation is enabled for the zone. */
  relationshipTranslation?: boolean;
  /** Custom attribute translations for the zone. */
  attributeTranslations?: TTranslations;
}

/** A collection of related zones within a board. */
export interface IView extends IBoardParentEntity<IZone> {}

/** Top-level board definition. */
export interface IBoard extends IBoardParentEntity<IView> {
  /** Email address of the board owner. */
  owner_email?: string;
  /** Whether the current user has write access to the board. */
  write_privilege?: boolean;
}

/**
 * The hierarchy of board entities, used to derive object types and for
 * type checking.
 */
export type TBoardEntity = IBoard | IView | IZone | IComponent;

/** Possible parent entity types. */
export type TParentBoardEntity = IBoard | IView | IZone;

/** Possible child entity types. */
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

/** Target metadata for fetching data from a remote object. */
export interface IRemoteTarget<T = TsDataSource> {
  /** Object type name used when fetching data from the data source. */
  objectType: string;
  /** Data source used to execute API requests. */
  dataSource: T;
}

/** Zone state and updater used by board controls. */
export interface IZoneControl {
  /** The active filter zone. */
  zone: IZone;
  /** Updates the zone after configuration changes reset downstream filters. */
  setZone: (zone: IZone) => void;
}

/** Remote target data combined with zone control state. */
export interface IRemoteTargetAndZone extends IRemoteTarget, IZoneControl {}

/** Board-specific data target metadata. */
export interface IBoardTarget {
  /** Object type for the board context. */
  boardObjectType: string;
  /** Data source used to fetch board data. */
  boardDataSource: TsDataSource;
}

/** A board target combined with zone context. */
export interface IBoardTargetAndZone
  extends IRemoteTargetAndZone, IBoardTarget {}

/** Optional utility bar instance. */
export type TUtilityBarOrNull = PUtilityBar | null;

/** Metadata passed to a zone hook for data fetch and mutation. */
export interface IUseZoneMeta {
  /** Object type of the zone's data. */
  objectType: string;
  /** Data source for the fetch operations. */
  dataSource: TsDataSource;
  /** Active zone. */
  zone: IZone;
  /** Updates the active zone. */
  setZone: (zone: IZone) => void;
}

/** API connection details for a database-backed data source instance. */
export interface IDBDataSourceInstanceApiDetails {
  /** Base URL for the data source instance. */
  url: string;
  /** API path segment used to access the instance. */
  apiPath: string;
  /** Data path segment used for entity data requests. */
  apiDataPath: string;
  /** Dataspace identifier for the instance. */
  dataspace: string;
}
