/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Filter,
  IFilter,
  TFilterOrUndefined,
  IRemoteTargetAndZone,
  PUtilityBar,
  UtilityBar,
  Row,
  Col,
  AttributeTitle,
} from "..";

export interface PRemoteFilters extends IRemoteTargetAndZone {
  /**
   * Optional initial filters applied to the component; defaults to an empty filter
   */
  filters?: IFilter;
  /**
   * State setter for updating the active filters in the parent component
   */
  setFilters: (filters: TFilterOrUndefined) => void;
  /**
   * Optional array of filter values to disable in the field selction UI
   */
  disabledFilterValues?: any;
  /**
   * Optional state setter for the parent component to indicate whether there are any pending filter changes
   */
  setHasPendingChanges?: (hasPendingChanges: boolean) => void;
  /**
   * Optional utility bar configuration (includes title, buttons, etc.)
   */
  utilityBarConfig?: PUtilityBar;
  /**
   * Optional unique identifier for the component within the zone
   */
  componentId: string;
  /**
   * Array of attributes used as the filters
   */
  attributes: string[];
  /**
   * Optional custom classname for the filter columns
   */
  customClassname?: string;
  /**
   * Optional extra element to render alongside each filter, receives the attribute as a prop
   */
  ExtraElement?: React.ComponentType<{ attribute: string }>;
}

/**
 * @autodoc
 * 
 * RemoteFilters is a component designed for managing and applying filters to data retrieved from
 * a remote `dataSource`. It provides dropdowns for selecting filter values based on specified attributes.
 */
export function RemoteFilters(props: PRemoteFilters) {
  const {
    objectType,
    dataSource,
    zone,
    setZone,
    componentId,
    attributes,
    customClassname,
    utilityBarConfig,
    ExtraElement
  } = props;

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});


  useEffect(() => {
    dataSource.getEntityMeta().then((em) => {
      setEntityMeta(em);
      setLoading(false);
    });
  }, []);

  if (loading) return <></>;

  return (
    <div>
      {utilityBarConfig && <UtilityBar {...utilityBarConfig} />}
      <Row>
        {attributes.map((attribute) => {
          const attributeMeta =
            entityMeta?.flatAttributes?.[objectType]?.[attribute];
          const type =
            attributeMeta?.cardinality < 50 &&
              attributeMeta?.python_type === "str"
              ? "multi"
              : attributeMeta?.python_type;

          return (
            <Col key={attribute} className={customClassname}>
              <AttributeTitle attributeId={attribute} objectType={objectType} dataSource={dataSource} className="tol-attribute-filter-title" />
              <div className="tol-remote-filters-container">
                <div className="tol-remote-filters-filter">
                  <Filter
                    key={`filter-${attribute}`}
                    attribute={attribute}
                    rename={attributeMeta?.display_name}
                    type={type}
                    componentId={componentId}
                    objectType={objectType}
                    dataSource={dataSource}
                    zone={zone}
                    setZone={setZone}
                    delay={0}
                  />
                </div>
                {ExtraElement && <ExtraElement attribute={attribute} />}
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
