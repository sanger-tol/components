/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  IFilterInput,
  setFilterInput,
  filterListener,
  MultipleSelect,
  FilterToggle,
  stopPropagation,
  PopUpMessage,
  API_METHODS,
  TFilterOrUndefined,
  generateFilter,
  filterHasUpdated,
  API_OPERATIONS,
  resetFiltersBelow,
  useEffectUpdate,
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
  const [exists, setExists] = useState<boolean>(false);
  const [negate, setNegate] = useState<boolean>(false);
  const [timeoutValue, setTimeoutValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<TFilterOrUndefined>({});
  const operator = "in_list";

  useEffect(() => {
    // Only fetch values if there is values from a pre-defined filter
    if (!fetched && values.length !== 0) {
      fetchValues();
    }
  }, [values]);

  useEffect(() => {
    const nextFilter = generateFilter(zone, componentId);
    if (filterHasUpdated(setFilter, filter, nextFilter)) {
      setFetched(false);
      resetFiltersBelow({ id: componentId, zone: zone });
      setZone({ ...zone });
    }
  }, [zone]);

  useEffectUpdate(() => {
    // Reset fetched status on filter change to ensure new values are fetched on next dropdown open
    setFetched(false);
  }, [filter]);

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
        filter: JSON.stringify(filter),
      }).toString();
      dataSource
        .custom({
          method: API_METHODS.GET,
          resource: `${objectType}${API_OPERATIONS.GROUP_STATS}?${queryParamsString}`,
        })
        .then((res: any) => {
          const statsValues = res.data.meta.stats;
          setData(statsValues.map((item: any) => item.key[attribute]));
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
          updateDropdownText("Error fetching values");
        })
        .finally(() => {
          setLoading(false);
          setFetched(true);
        });
    }
  };

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: [operator],
    zone: zone,
    setValue: setValues,
    setExists: setExists,
    setNegate: setNegate,
    emptyValue: [],
    zoneToValue: (filterValue: any) => {
      return filterValue;
    },
  });

  const onFilter = (input: string[]) => {
    setValues(input);
    const delay = input.length === 0 ? 0 : props.delay;
    clearTimeout(timeoutValue!);
    setTimeoutValue(
      setTimeout(() => {
        setFilterInput({
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
    setFilterInput({
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
    setFilterInput({
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
        value={values}
        setValue={onFilter}
        loading={loading}
        onEntering={() => setDropdownText()}
        onClick={(e) => {
          console.log(filter)
          e.stopPropagation();
          fetchValues();
        }}
      />
      <FilterToggle
        negate={negate}
        onNegate={onNegate}
        exists={exists}
        onExists={onExists}
      />
    </div>
  );
}
