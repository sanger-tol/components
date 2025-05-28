/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  HistogramGrouping,
  IFilter,
} from '..';


export interface IComponent {
  data: IComponentData;
}

export interface IComponentData {
  id?: string;
  filter?: IFilter;
  defaultFilter?: IFilter;
  subFilter?: IFilter;
  filterPassThrough?: boolean;
  type?: string; // component type e.g. table
  size?: string; // component size e.g. sm
  order?: number;
}

export interface IComponents {
  [id: string]: IComponent;
}

// filtering is at the zone level
export interface IZone {
  components: IComponents;
  order: string[];
  filter?: IFilter;
  defaultFilter?: IFilter;
  type?: string;
}

export interface IZones {
  [id: string]: IZone;
}

export interface IView {
  zones: IZones;
  order: string[];
}

export interface IViews {
  [id: string]: IView;
}

export interface IBoard {
  views: IViews;
  order: string[];
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
  objectType: string;
  dataSource: TsDataSource;
}

export interface IZoneControl {
  zone: IZone;
  setZone: (zone: IZone) => void;
}

export interface IRemoteTargetAndZone extends IRemoteTarget, IZoneControl {}

export interface IBoardTargetAndZone extends IRemoteTargetAndZone {
  boardObjectType: string;
  boardDataSource: TsDataSource;
}

export interface IChartConfig {
  breakDownBy: string,
  xAxis: string,
  stacked: boolean,
  grouping: HistogramGrouping,
  chartType: 'bar' | 'line' | 'scatter',
}
