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
  getAttributeDetail,
  generateFilter,
  TFilterOrUndefined,
  deepCopy,
  IRemoteTargetAndZone,
  PUtilityBar,
  UtilityBar,
} from "..";

export interface PAttributeFilters extends IRemoteTargetAndZone {
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
  utilityBarConfig?: PUtilityBar;
  componentId: string;
  attributes: string[];
}

/**
 * @autodoc
 * 
 * RemoteFilters is a component designed for managing and applying filters to data retrieved from
 * a remote `dataSource`. It allows users to dynamically add or remove filters, with support for
 * various attribute types and loading states.
 */
export function AttributeFilters(props: PAttributeFilters) {
  const {
    objectType,
    dataSource,
    filters = { and_: {} },
    setFilters,
    setHasPendingChanges,
    zone,
    setZone,
    componentId,
    attributes
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

  // Use passed zone/setZone if provided, otherwise use local state\
  // need to replace this with useStateFallback
  const activeZone = zone || filterZone;
  const activeSetZone = setZone || setFilterZone;

  useEffect(() => {
    dataSource.getEntityMeta().then((em) => {
      setEntityMeta(em);
      setLoading(false);
    });
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

  useEffect(() => {
    setInitialFilters(deepCopy(filters));
  }, []);

  if (loading) return <></>;

  return (
    <div>
      <UtilityBar {...props.utilityBarConfig} />
      {attributes.map((attribute) => {
        const attributeMeta =
          entityMeta?.flatAttributes?.[objectType]?.[attribute];
        const type =
          attributeMeta?.cardinality < 50 &&
            attributeMeta?.python_type === "str"
            ? "multi"
            : attributeMeta?.python_type;

        return (
          <div className="tol-filters" key={attribute}>
            {`${getAttributeDetail(entityMeta, objectType, attribute, 'display_name')}:`}
            <div className="filter">
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
          </div>
        );
      })}
    </div>
  );
}
