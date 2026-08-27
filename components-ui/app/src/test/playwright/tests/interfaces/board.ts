// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

/**
 * Values used to create a board and, optionally, an associated view and zone.
 */
export interface ICreateBoard {
  /**
   * ID of the user who owns the created entities.
   */
  userId: string;
  /**
   * Board ID. A generated ID is used when omitted.
   */
  boardId?: string;
  /**
   * Board title. Defaults to "Test Board".
   */
  boardTitle?: string;
  /**
   * ID of the view to associate with the board.
   */
  viewId?: string;
  /**
   * View title. Defaults to "Test View" when a view is created.
   */
  viewTitle?: string;
  /**
   * ID of the zone to associate with the view.
   */
  zoneId?: string;
  /**
   * Zone title. Defaults to "Test Zone" when a zone is created.
   */
  zoneTitle?: string;
  /**
   * ID of the data_source_instance to use for this zone (controls the dataspace).
   * Defaults to DATASOURCE_INSTANCE_ID
   */
  zoneDataSourceInstanceId?: string;
  /**
   * Object type for the zone.
   */
  zoneObjectType?: string;
}

// TODO: Add when required
// export interface ICreateViewInBoard {}

/**
 * Values used to create a zone and associate it with an existing view.
 */
export interface ICreateZoneInView {
  /**
   * ID of the user who owns the zone.
   */
  userId: string;
  /**
   * Parent view ID to associate the zone with.
   */
  viewId: string;
  /**
   * Object type for the zone.
   */
  objectType: string;
  /**
   * ID of the datasource instance used by the zone.
   */
  datasourceInstanceId?: string;
  /**
   * Zone title. Defaults to "Test Zone".
   */
  title?: string;
  /**
   * Filter configuration applied to the zone.
   */
  filter?: object;
  /**
   * Position of the zone within the view. Defaults to 1.
   */
  order?: number;
}

/**
 * Values used to create a component and associate it with an existing zone.
 */
export interface ICreateComponentInZone {
  /**
   * ID of the user who owns the component.
   */
  userId: string;
  /**
   * Display title of the component.
   */
  componentTitle: string;
  /**
   * ID of the zone that will contain the component.
   */
  zoneId: string;
  /**
   * Component type. Defaults to "table".
   */
  componentType?: string;
  /**
   * ID of the datasource instance used by the component.
   */
  datasourceInstanceId?: string;
  /**
   * Filter configuration applied to the component.
   */
  filter?: object;
  /**
   * Type-specific component configuration.
   */
  config?: object;
  /**
   * Widget size used to render the component. Defaults to "lg".
   */
  widgetType?: string;
  /**
   * Object type represented by the component.
   */
  objectType?: string;
  /**
   * Position of the component within the zone. Defaults to 1.
   */
  order?: number;
}

/**
 * Optional values accepted when creating a populated board for a test.
 */
export interface ICreateBoardOptional extends Partial<ICreateBoard> { }

/**
 * Values returned after creating a board.
 */
export interface ICreateBoardReturn extends ICreateBoard {
  /**
   * ID of the created board.
   */
  boardId: string;
  /**
   * Title of the created board.
   */
  boardTitle: string;
}

/**
 * Values returned after creating a board and an associated view.
 */
export interface ICreateBoardAndViewReturn extends ICreateBoardReturn {
  /**
   * ID of the created view.
   */
  viewId: string;
  /**
   * Title of the created view.
   */
  viewTitle: string;
}

/**
 * Values returned after creating a board, view, and zone hierarchy.
 */
export interface ICreateBoardAndViewAndZoneReturn extends ICreateBoardAndViewReturn {
  /**
   * ID of the created zone.
   */
  zoneId: string;
  /**
   * Title of the created zone.
   */
  zoneTitle: string;
  /**
   * Object type represented by the created zone.
   */
  zoneObjectType: string;
}
