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
import { Button, InfoTooltip, useEffectUpdate } from "..";
import MultipleSelect from "../forms/MultipleSelect";
import { normaliseCaps } from "../general/Utils";


export interface Props {
  filters?: IFilter,
  endpoint: string,
  baseUrl?: string,
  onSave?: any
  disabledFilterValues?: any
}

function RemoteFilters(props: Props) {
  const { endpoint, baseUrl, onSave, disabledFilterValues } = props;
  const ds = new TsDataSource({baseUrl});

  // zone component id pointer
  const filterComponentId = 'filters-component';

  // just keeps track of the filter ids and their order
  const [filters, setFilters] = useState(Object.keys(props.filters?.and_ || {}));
  const [disabledApplyButton, setDisabledApplyButton] = useState(true);

  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});

  // repurposed zone so filters correctly interact with the state
  const [filterZone, setFilterZone] = useState<Zone>(
    defineZone(
      'filter',
      [{id: filterComponentId, filter: props.filters}]
    )
  );

  useEffect(() => {
    ds.getEntityMeta().then(em => {
      setEntityMeta(em);
      setLoading(false);
    })
  }, []);

  // allow to apply when changes have been made
  useEffectUpdate(() => {
    setDisabledApplyButton(false);
  }, [filterZone])

  const removeFilter = (attribute: string) => {
    // update the filters that are shown
    const f = filters.filter(str => str !== attribute);
    setFilters(f);

    // update the zone state which builds the filter ready for the api
    if (filterZone.components[filterComponentId].data.filter?.and_[attribute]) {
      const updatedComponents = { ...filterZone.components };
      delete updatedComponents[filterComponentId].data.filter?.and_[attribute];      
      setFilterZone({
        ...filterZone,
        components: updatedComponents
      });
    }
  }

  if (loading) return <></>

  const getDisplayName = (attribute: string) => {
    return entityMeta?.flatAttributes?.[endpoint]?.[attribute]?.display_name || normaliseCaps(attribute)
  }

  const renderMenuItem = (l: any) => {
    const label = l.props?.children || l; // changes form in some instances!
    const disabled = Object.keys(disabledFilterValues).includes(label);
    const tooltipConents = "A filter already exists in the filtering system. Please remove it before adding this filter."
    return (
      <>
        {getDisplayName(label)}
        {disabled ?
          <span style={{marginLeft: 8}}>
          <InfoTooltip disableMarkdown contents={tooltipConents}/>
          </span>
          :
          <></>
        }
      </>
    );
  };

  const renderValue = (values: string[]) => {
    const numPopulatedFilter = Object.keys(filterZone.components[filterComponentId].data.filter?.and_!).length;
    return (`
      ${values.length} ${values.length === 1 ? "filter": "filters"} selected;
      ${numPopulatedFilter} ${numPopulatedFilter === 1 ? "filter": "filters"} populated.
    `)
  };

  const searchBy = (keyword: string, label: any) => {
    const name = getDisplayName(label).toLowerCase();
    const kw = keyword.toLowerCase();
    return name.includes(kw);
  }
  
  return (
    <div>
      <div className="tol-filters-selector">
        <MultipleSelect
          block
          noSelectAll
          data={Object.keys(entityMeta.flatAttributes[endpoint])}
          placeholder="No filters applied, click here to add..."
          value={filters}
          setValue={setFilters}
          renderMenuItem={renderMenuItem}
          renderValue={renderValue}
          disabledItemValues={Object.keys(disabledFilterValues)}
          searchBy={searchBy}
        />
      </div>
      {filters.map(attribute => {
        const attributeMeta = entityMeta?.flatAttributes?.[endpoint]?.[attribute];
        const type = (
          attributeMeta?.cardinality < 20 &&
          attributeMeta?.python_type === 'str'
        ) ? 'multi' : attributeMeta?.python_type;

        return (
          <div className="tol-filters" key={attribute}>
            {`${getDisplayName(attribute)}:`}
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
            />
          </div>
        )
      })}
      <Button 
        disabled={disabledApplyButton}
        type="success"
        onClick={() => onSave(filterZone?.components?.[filterComponentId]?.data?.filter)}
        text="Apply Filters"
        icon="floppy-disk"
      />
      
    </div>
  )
}

export default RemoteFilters;
