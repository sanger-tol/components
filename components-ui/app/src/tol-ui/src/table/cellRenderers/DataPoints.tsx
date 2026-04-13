/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
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
  /**
   * Semantic role of the field (e.g. "status"), used to apply special
   * editing behaviour such as a status-type dropdown.
   */
  actsAs?: string;
}

/**
 * Data points renderer. Used to render multiple data points.
 * Can take a renderer to allow for custom rendering of each data point.
 */
export function DataPoints(props: PDataPoints) {
  const { field, dataObject, dataSource } = props;

  // State to track whether there could be multiple data points to render.
  const [isMany, setIsMany] = useState(false);
  const [loading, setLoading] = useState(true);

  // get the child objects based on the field
  const childObjects = getChildObjectsByName(dataObject, field);

  // get the attribute part of the field
  const attribute = getAttributeNameByField(field);

  useEffect(() => {
    if (dataObject) {
      dataSource
        .isManyDataPointsByName(
          dataObject.objectType,
          field
        )
        .then(isMany => {
          setIsMany(isMany);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [field, dataObject]);

  /**
   * getRelationshipConfig (used in isManyDataPointsByName) is already stored in cache
   * when this component is used so we don't need a loading wheel - although it still 
   * needs to be async.
   */
  if (loading) return;

  const collectDataPoints = childObjects?.map((obj, index) => (
    <DataPoint
      {...props}
      key={`${field}-${index}`}
      dataObject={obj}
      field={attribute}
      isMany={isMany}
    />
  ))

  return (
    <div className="tol-data-points">
      {collectDataPoints}
    </div>
  )
}