/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Filter,
  IRemoteTargetAndZone,
  PUtilityBar,
  UtilityBar,
  Row,
  Col,
  AttributeTitle,
  FILTER_INPUT_DELAY,
} from "..";

export interface PRemoteFilters extends IRemoteTargetAndZone {
  /**
   * Optional utility bar configuration (includes title, buttons, etc.)
   */
  utilityBarConfig?: PUtilityBar;
  /**
   * Unique identifier for the component within the zone
   */
  componentId: string;
  /**
   * Array of attributes used as the filters
   */
  attributes: string[];
  /**
   * Optional custom classname for the filter columns
   */
  className?: string;
  /**
   * Optional delay in milliseconds before applying the filter after user input. Defaults to 800ms.
   */
  delay?: number;
  /**
   * Optional extra element to render alongside each filter, receives the attribute as a prop
   */
  ExtraElement?: React.ComponentType<{
    /**
   * The attribute that is passed to the element as a prop
   */
    attribute: string
  }>;
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
    className,
    utilityBarConfig,
    delay = FILTER_INPUT_DELAY,
    ExtraElement,
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
            <Col key={attribute} className={className}>
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
                    delay={delay}
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
