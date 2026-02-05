/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  IZone,
  defineZone,
  Filter,
  IFilter,
  generateFilter,
  TFilterOrUndefined,
  deepCopy,
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
  componentId?: string;
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
    filters = { and_: {} },
    setFilters,
    setHasPendingChanges,
    zone,
    setZone,
    componentId,
    attributes,
    customClassname,
    ExtraElement
  } = props;

  const [initialFilters, setInitialFilters] = useState<IFilter>(deepCopy(filters));

  // zone component id pointer
  const filterComponentId = componentId || "remote-filters-component";

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});

  // repurposed zone so filters correctly interact with the state
  const [filterZone, setFilterZone] = useState<IZone>(
    defineZone("dummy-object-for-remote-filters", [
      { id: filterComponentId, filter: filters },
    ]),
  );

  // Use passed zone/setZone only if componentId is also defined, otherwise use local state
  // Could have used useStateFallback here but this logic required the additional check with componentId
  const activeZone = (zone && componentId) ? zone : filterZone;
  const activeSetZone = (componentId) ? setZone : setFilterZone;


  useEffect(() => {
    dataSource.getEntityMeta().then((em) => {
      setEntityMeta(em);
      setLoading(false);
    });
    setInitialFilters(deepCopy(filters));
  }, []);

  useEffect(() => {
    const newFilter = generateFilter(activeZone, filterComponentId);
    setFilters(newFilter);
    if (setHasPendingChanges) {
      setHasPendingChanges(
        JSON.stringify(newFilter) !== JSON.stringify(initialFilters),
      );
    }
  }, [activeZone]);

  if (loading) return <></>;

  return (
    <div>
      <UtilityBar {...props.utilityBarConfig} />
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
            <>
              <Col key={attribute} className={customClassname}>
                <AttributeTitle attributeId={attribute} objectType={objectType} dataSource={dataSource} className="tol-attribute-filter-title" />
                <div>
                  <Filter
                    key={`filter-${attribute}`}
                    attribute={attribute}
                    rename={attributeMeta?.display_name}
                    type={type}
                    componentId={filterComponentId}
                    objectType={objectType}
                    dataSource={dataSource}
                    zone={activeZone}
                    setZone={activeSetZone}
                    delay={0}
                  />
                </div>
              </Col>
              {ExtraElement && <ExtraElement attribute={attribute} />}
            </>
          );
        })}
      </Row>
    </div>
  );
}
