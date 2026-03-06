/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  IFilterInput,
  setFilter,
  filterListener,
  MultipleSelect,
  FilterToggle,
  stopPropagation,
  PopUpMessage,
  API_METHODS,
  TFilterOrUndefined,
  generateFilter,
  filterHasUpdated,
  appendKeywordIfNeeded,
  removeAttributeFromFilter,
  API_OPERATIONS,
} from "..";


export function FilterMultiSelect(props: IFilterInput) {
  const {
    attribute,
    componentId,
    rename,
    objectType,
    dataSource,
    zone,
    setZone
  } = props;
  const [data, setData] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [exists, setExists] = useState<boolean>(false);
  const [negate, setNegate] = useState<boolean>(false);
  const [timeoutValue, setTimeoutValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [aggregationFilter, setAggregationFilter] = useState<TFilterOrUndefined>({});
  const operator = "in_list";

  useEffect(() => {
    if (!fetched && values.length !== 0) {
      fetchValues();
    }
  }, [values]);

  useEffect(() => {
    const nextFilter = removeAttributeFromFilter(
      generateFilter(zone, componentId, true),
        attribute,
    );
    if (filterHasUpdated(setAggregationFilter, aggregationFilter, nextFilter)) {
      setFetched(false);
      setData([]);
    }
  }, [zone]);

  useEffect(() => {
    errorMessage && PopUpMessage({ message: errorMessage, type: "error" });
  }, [errorMessage]);

  const fetchValues = () => {
    if (!fetched) {
      setLoading(true);
      // TEMPORARY FIX:
      // Construct a URL param string and append it to the resource, because:
      // a. The API doesn't handle empty strings/arrays for this resource very well
      // b. Empty arrays are being parsed out, and the params are required on the API
      // c. Should switch to a POST method in the near future.
      // TODO: Remove on POST method implementation
      const queryParamsString = new URLSearchParams({
        group_by: attribute,
        stats_fields: "",
        stats: "",
        object_filters: JSON.stringify(aggregationFilter),
      }).toString();
      dataSource
        .custom({
          method: API_METHODS.GET,
          resource: `${objectType}${API_OPERATIONS.GROUP_STATS}?${queryParamsString}`,
        })
        .then((res: any) => {
          const statsValues = res.data.meta.stats;
          setData(statsValues.map((item: any) => item.key[attribute]));
          setLoading(false);
          setFetched(true);
          updateDropdownText("No results found");
        })
        .catch((error: any) => {
          setErrorMessage(
            "Error fetching unique values for " +
              attribute +
              " in " +
              objectType +
              ". " +
              error.message +
              ".",
          );
          console.error(error.message);
          setLoading(false);
          setFetched(true);
          updateDropdownText("Error fetching values");
        });
    }
  };

  filterListener(
    {
      attribute: attribute,
      componentId: componentId,
      operators: [operator],
      zone: zone,
      setValue: setValues,
      setExists: setExists,
      setNegate: setNegate,
      setDisabled: setDisabled,
      emptyValue: [],
      zoneToValue: (filterValue: any) => {
        return filterValue;
      },
    },
    [zone],
  );

  const onFilter = (input: string[]) => {
    setValues(input);
    const delay = input.length === 0 ? 0 : props.delay;
    clearTimeout(timeoutValue!);
    setTimeoutValue(
      setTimeout(() => {
        setFilter({
          operator: operator,
          value: input,
          negate: negate,
          attribute: attribute,
          componentId: componentId,
          zone: zone,
          valueExists: input.length !== 0,
        });
        setZone({ ...zone });
      }, delay ?? 800),
    );
  };

  const onExists = (ex: boolean) => {
    setExists(!ex);
    setValues([]);
    setFilter({
      operator: "exists",
      negate: negate,
      exists: !ex,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
    });
    setZone({ ...zone });
  };

  const onNegate = (ng: boolean) => {
    setNegate(!ng);
    setFilter({
      operator: exists ? "exists" : operator,
      value: values,
      negate: !ng,
      exists: exists,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      valueExists: values.length !== 0,
    });
    setZone({ ...zone });
  };

  const updateDropdownText = (text: string) => {
    const div = document.querySelector(".rs-picker-none");
    if (div) div.innerHTML = text;
  };

  const setDropdownText = () => {
    if (!fetched) updateDropdownText("Loading values...");
    else if (errorMessage !== "") updateDropdownText("Error fetching values");
  };

  return (
    <div className="tol-multi-filter" onClick={stopPropagation}>
      <MultipleSelect
        block
        data={data}
        placeholder={rename}
        disabled={disabled}
        value={values}
        setValue={onFilter}
        loading={loading}
        onEntering={() => setDropdownText()}
        onClick={(e) => {
          e.stopPropagation();
          fetchValues();
        }}
      />
      <FilterToggle
        negate={negate}
        onNegate={onNegate}
        exists={exists}
        onExists={onExists}
        disabled={disabled}
      />
    </div>
  );
}
