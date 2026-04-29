/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  defineBoardEntity,
  IComponent,
  IDataObject,
  TsDataSource
} from "../..";


/**
 * Converts a component data object and its associated zone data object to component parameters for use in the board state.
 * 
 * @param componentDataObject The data object representing the component, retrieved from the data source.
 * @param componentZoneDataObject The data object representing the zone that the component belongs to, retrieved from the data source.
 * @returns An object containing the component parameters to be used in the board state.
 */
export function dataObjectsToComponentParams(componentDataObject: IDataObject, componentZoneDataObject: IDataObject): IComponent {
  const dsi = componentDataObject?.relationships?.data_source_instance as IDataObject;
  return defineBoardEntity<IComponent>(
    {
      id: componentDataObject.id,
      title: componentDataObject.title,
      objectType: componentDataObject.object_type,
      filter: componentDataObject.filter,
      filterPassThrough: componentDataObject.filter_pass_through,
      componentZoneId: componentZoneDataObject.id,
      componentZoneOrder: componentZoneDataObject.order,
      dataspace: new TsDataSource({
        dataSourceInstanceId: dsi?.id,
        ...dsi?.ui_api_details,
      }),
      type: componentDataObject.component_type,
      config: componentDataObject.config,
      size: componentDataObject.widget_type,
    },
    BOARDS.COMPONENT
  );
}
