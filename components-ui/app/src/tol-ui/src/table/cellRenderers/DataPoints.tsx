/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TDataObjectOrNull,
  TCellRenderer,
  ICustomCellRenderers,
  TsDataSource,
  getChildObjectsByName,
  DataPoint,
  getAttributeNameByField,
} from "../..";


export interface PDataPoints {
  /**
   * The attribute name which acts as a pointer in the dataObject.
   */
  field: string,
  /**
   * The data object which the data point is based on.
   */
  dataObject: TDataObjectOrNull,
  /**
   * The data source which the data object belongs to.
   */
  dataSource: TsDataSource,
  /**
   * The renderer to use for the data point.
   */
  renderer: TCellRenderer;
  /**
   * Setter function to set the expanded rows in a table.
   */
  setExpandedRows: any,
  /**
   * Custom cell renderers that can be used in addition to the pre-defined renderers.
   */
  customCellRenderers?: ICustomCellRenderers;
  /**
   * Flag to indicate if the cell is editable.
   */
  editable?: boolean;
}

/**
 * Data points renderer. Used to render multiple data points.
 * Can take a renderer to allow for custom rendering of each data point.
 */
export function DataPoints(props: PDataPoints) {
  const { dataObject, field } = props;

  // get the child objects based on the field
  const childObjects = getChildObjectsByName(dataObject, field);

  // get the attribute part of the field
  const attribute = getAttributeNameByField(field);

  // temp solution to determine if we are dealing with a "many" relationship
  //const isManyRelationship = Array.isArray(getFieldByName(dataObject, field));

  const collectDataPoints = childObjects?.map((obj, index) => (
    <DataPoint
      {...props}
      key={`${field}-${index}`}
      dataObject={obj}
      field={attribute}
      isTag={childObjects.length > 1}
    />
  ))

  return (
    <div className="tol-data-points">
      {collectDataPoints}
    </div>
  )
}