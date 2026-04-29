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

export type TBoardEntityOrder = string[];

export interface IComponent {
  id?: string;
  filter?: IFilter;
  defaultFilter?: IFilter;
  subFilter?: IFilter;
  filterPassThrough?: boolean;
  /**
   * The component type e.g. table
   */
  type?: string;
  /**
   * The size of the component e.g. sm, md, lg
   */
  size?: string;

  // extras required just for boards
  title?: string;
  objectType?: string;
  dataspace?: TsDataSource;
  config?: any;

  // used for reordering in the db
  componentZoneId?: string;
  componentZoneOrder?: number;
}

export interface IComponents {
  [id: string]: IComponent;
}

export interface IZone {
  id?: string;
  components: IComponents;
  order: TBoardEntityOrder;
  filter?: IFilter;
  defaultFilter?: IFilter;
  objectType?: string;

  // extras required just for boards
  title?: string;
  dataspace?: TsDataSource;

  // used for reordering in the db
  zoneViewId?: string;
  zoneViewOrder?: number;
}

export interface IZones {
  [id: string]: IZone;
}

export interface IView {
  id?: string;
  zones: IZones;
  order: TBoardEntityOrder;

  // extras required just for boards
  title?: string;

  // used for reordering in the db
  viewBoardId?: string;
  viewBoardOrder?: number;
}

export interface IViews {
  [id: string]: IView;
}

export interface IBoard {
  id?: string;
  views: IViews;
  order: TBoardEntityOrder;

  // extras required just for boards
  title?: string;
  ownerUserId?: string;
}

/*
example layout of a board:

export const exampleBoard: Board = {
  views: {
    'viewIdOne': {
      zones: {
        'zoneIdOne': {
          components: {
            'componentIdOne': {
              filter: {
                and_: {
                  'attributeId': {
                    eq: {
                      value: 'hello',
                      negate: true
                    }
                  }
                }
              },
              defaultFilter: {
                and_: {
                  'attributeId': {
                    eq: {
                      value: 'hello',
                      negate: true
                    }
                  }
                }
              }
            },
          },
          order: ['componentIdOne'],
          type: 'species'
        }
      },
      order: ['zoneIdOne']
    }
  },
  order: ['viewIdOne']
};
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
