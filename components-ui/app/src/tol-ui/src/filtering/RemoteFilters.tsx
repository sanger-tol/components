/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { TsDataSource } from "../services";
import { Zone } from "../board";
import { defineZone } from "../board/Utils";
import Filter from "./Filter";
import { IFilter } from "../models";
import { Button, useEffectUpdate } from "..";
import { AttributeSelector } from "../components";
import { getDisplayName } from "../components/Utils";

export interface Props {
  filters?: IFilter;
  endpoint: string;
  baseUrl?: string;
  onSave?: any;
  disabledFilterValues?: any;
}

const PLACEHOLDER = "No filters applied, click here to add...";
const TOOLTIPCONTENT = "A filter already exists in the filtering system. Please remove it before adding this filter."
function RemoteFilters(props: Props) {
  const { endpoint, baseUrl, onSave, disabledFilterValues } = props;
  const ds = new TsDataSource({ baseUrl });

  // zone component id pointer
  const filterComponentId = "remote-filters-component";

  // just keeps track of the filter ids and their order
  const [filters, setFilters] = useState(
    Object.keys(props.filters?.and_ || {})
  );
  const [disabledApplyButton, setDisabledApplyButton] = useState(true);

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});

  // repurposed zone so filters correctly interact with the state
  const [filterZone, setFilterZone] = useState<Zone>(
    defineZone("dummy-object-for-remote-filters", [
      { id: filterComponentId, filter: props.filters },
    ])
  );

  useEffect(() => {
    ds.getEntityMeta().then((em) => {
      setEntityMeta(em);
      setLoading(false);
    });
  }, []);

  // allow to apply when changes have been made
  useEffectUpdate(() => {
    setDisabledApplyButton(false);
  }, [filterZone]);

  const removeFilter = (attribute: string) => {
    // update the filters that are shown
    const f = filters.filter((str) => str !== attribute);
    setFilters(f);

    // update the zone state which builds the filter ready for the api
    if (filterZone.components[filterComponentId].data.filter?.and_[attribute]) {
      const updatedComponents = { ...filterZone.components };
      delete updatedComponents[filterComponentId].data.filter?.and_[attribute];
      setFilterZone({
        ...filterZone,
        components: updatedComponents,
      });
    }
  };

  if (loading) return <></>;

  return (
    <div>
      <AttributeSelector
        disabledValues={disabledFilterValues}
        placeholder={PLACEHOLDER}
        attribute={filters}
        setAttribute={setFilters}
        endpoint={endpoint}
        baseUrl={baseUrl}
        numPopulatedFields={
          Object.keys(
            filterZone.components[filterComponentId].data.filter?.and_ || {}
          ).length
        }
        allowedTypes={["int"]}
        tooltipContent={TOOLTIPCONTENT}
      />
      {filters.map((attribute) => {
        const attributeMeta =
          entityMeta?.flatAttributes?.[endpoint]?.[attribute];
        const type =
          attributeMeta?.cardinality < 20 &&
          attributeMeta?.python_type === "str"
            ? "multi"
            : attributeMeta?.python_type;

        return (
          <div className="tol-filters" key={attribute}>
            {`${getDisplayName(entityMeta, endpoint, attribute)}:`}
            <div className="filter">
              <Filter
                key={`filter-${attribute}`}
                attribute={attribute}
                rename={attributeMeta?.display_name}
                type={type}
                componentId={filterComponentId}
                zone={filterZone}
                setZone={setFilterZone}
                endpoint={endpoint}
                baseUrl={baseUrl}
              />
            </div>
            <Button
              onClick={() => removeFilter(attribute)}
              className="remove-filter-button"
              type="error"
              icon="trash"
              position="right"
              outline
            />
          </div>
        );
      })}
      <Button
        disabled={disabledApplyButton}
        type="success"
        onClick={() =>
          onSave(filterZone?.components?.[filterComponentId]?.data?.filter)
        }
        text="Apply Filters"
        icon="floppy-disk"
      />
    </div>
  );
}

export default RemoteFilters;
