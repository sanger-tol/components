/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  Button,
  useEffectUpdate,
  IRemoteTarget,
  IZone,
  defineZone,
  Filter,
  IFilter,
  AttributeSelector,
  Icon,
  getAttributeDetail,
} from "..";


interface Props extends IRemoteTarget{
  filters?: IFilter;
  onSave?: any;
  disabledFilterValues?: any;
  filterPassThrough?: boolean;
}

export function RemoteFilters(props: Props) {
  const { objectType, dataSource, onSave, disabledFilterValues, filterPassThrough } = props;

  // zone component id pointer
  const filterComponentId = "remote-filters-component";

  // just keeps track of the filter ids and their order
  const [filters, setFilters] = useState(
    Object.keys(props.filters?.and_ || {}),
  );
  const [disabledApplyButton, setDisabledApplyButton] = useState(true);
  const [loading, setLoading] = useState(true);
  const [entityMeta, setEntityMeta] = useState<any>({});

  // repurposed zone so filters correctly interact with the state
  const [filterZone, setFilterZone] = useState<IZone>(
    defineZone("dummy-object-for-remote-filters", [
      { id: filterComponentId, filter: props.filters },
    ]),
  );

  useEffect(() => {
    dataSource.getEntityMeta().then((em) => {
      setEntityMeta(em);
      setLoading(false);
    });
  }, []);

  // allow to apply when changes have been made
  useEffectUpdate(() => {
    setDisabledApplyButton(false);
  }, [filterZone, filterPassThrough]);

  const removeFilter = (attribute: string) => {
    // update the filters that are shown
    const f = filters.filter((str) => str !== attribute);
    setFilters(f);

    // update the zone state which builds the filter ready for the api
    if (filterZone.components[filterComponentId].data.filter?.and_?.[attribute]) {
      const updatedComponents = { ...filterZone.components };
      delete updatedComponents[filterComponentId].data.filter?.and_?.[attribute];
      setFilterZone({
        ...filterZone,
        components: updatedComponents,
      });
    }
  };

  const onClean = () => {
    if (filterZone.components[filterComponentId].data.filter) {
      filterZone.components[filterComponentId].data.filter.and_ = {};
    }
    if (filterZone.components[filterComponentId].data.defaultFilter) {
      filterZone.components[filterComponentId].data.defaultFilter.and_ = {};
    }
    setFilterZone({ ...filterZone });
  };

  if (loading) return <></>;

  const PLACEHOLDER = "No filters applied, click here to add...";
  const TOOLTIP_CONTENT =
    "A filter already exists in the filtering system. Please remove it before adding this filter.";

  return (
    <div>
      <AttributeSelector
        {...props}
        displaySource
        recommendedFilterAvailable
        renderSearchBySource
        disabledValues={disabledFilterValues}
        placeholder={PLACEHOLDER}
        attribute={filters}
        setAttributes={setFilters}
        populatedFieldType="filter"
        numPopulatedFields={
          Object.keys(
            filterZone.components[filterComponentId].data.filter?.and_ || {},
          ).length
        }
        tooltipContent={TOOLTIP_CONTENT}
        onClean={onClean}
      />
      {filters.map((attribute) => {
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
                zone={filterZone}
                setZone={setFilterZone}
                delay={0}
              />
            </div>
            <span
              className="remove-filter-button"
              onClick={() => removeFilter(attribute)}
            >
              <Icon icon="close" size="lg" />
            </span>
          </div>
        );
      })}
      <Button
        disabled={disabledApplyButton}
        type="success"
        onClick={() =>
          onSave(filterZone?.components?.[filterComponentId]?.data?.filter, filterPassThrough)
        }
        text="Apply Filters"
        icon="floppy-disk"
        testid="apply-filter-button"
      />
    </div>
  );
}
