/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  IFilter,
  PUtilityBar,
} from '..';

export type TBoardEntityOrder = string[];

export interface IComponent {
  data: IComponentData;
}

export interface IComponentData {
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
  components?: IComponents;
  order?: TBoardEntityOrder;
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
  zones: IZones;
  order: TBoardEntityOrder;
}

export interface IViews {
  [id: string]: IView;
}

export interface IBoard {
  views: IViews;
  order: TBoardEntityOrder;
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
              data: {
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
            }
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

export type TBoardLevel = "views" | "zones" | "components";

export interface IUpdatedZoneIds {
  newZoneId: string;
  newZoneViewId: string;
}

export interface IDBDataSourceInstanceApiDetails {
  url: string;
  apiPath: string;
  apiDataPath: string;
  dataspace: string;
}
