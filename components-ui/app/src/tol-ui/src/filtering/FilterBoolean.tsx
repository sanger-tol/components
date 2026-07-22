/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import {
  IFilterInput,
  setFilterInput,
  filterListener,
  MultipleSelect,
  StatusMessage,
  PopUpMessage,
  FILTER_INPUT_DELAY,
} from "..";


export function FilterBoolean(props: IFilterInput) {
  const { attribute, componentId, rename, zone, setZone, delay } = props;
  const [values, setValues] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [timeoutValue, setTimeoutValue] = useState<any>(null);
  const [errorMessage, _] = useState("");
  const operator = "in_list";

  useEffect(() => {
    errorMessage && PopUpMessage({ message: errorMessage, type: "error" });
  }, [errorMessage]);

  const flipValues = (val: string[]) => {
    const convertedValues: string[] = [];
    for (const v of val) {
      switch (v) {
        case "True":
          convertedValues.push("true");
          continue;
        case "true":
          convertedValues.push("True");
          continue;
        case "False":
          convertedValues.push("false");
          continue;
        case "false":
          convertedValues.push("False");
          continue;
      }
    }
    return convertedValues;
  };

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: [operator],
    zone: zone,
    setValue: setValues,
    setDisabled: setDisabled,
    emptyValue: [],
    zoneToValue: (filterValue: any) => {
      return flipValues(filterValue);
    },
  });

  const onFilter = (input: string[]) => {
    setValues(input);
    clearTimeout(timeoutValue!);
    setTimeoutValue(
      setTimeout(() => {
        setValues(input);
        setFilterInput({
          operator: operator,
          value: flipValues(input),
          negate: false,
          attribute: attribute,
          componentId: componentId,
          zone: zone,
          hasValue: input.length !== 0,
        });
        setZone({ ...zone });
      }, delay ?? FILTER_INPUT_DELAY),
    );
  };

  const renderItem = (label: string) => {
    switch (label) {
      case "True":
        return <StatusMessage message="True" status="success" />;
      case "False":
        return <StatusMessage message="False" status="error" />;
    }
  };

  const renderValue = (val: any[]) => {
    return val.map((v) => {
      return <div key={v}>{renderItem(v)}</div>;
    });
  };

  return (
    <span className="tol-boolean-filter">
      <MultipleSelect
        block
        noSearch
        data={["True", "False"]}
        placeholder={rename}
        disabled={disabled}
        value={values}
        setValue={onFilter}
        onClick={(e) => e.stopPropagation()}
        renderMenuItem={renderItem}
        renderValue={renderValue}
      />
    </span>
  );
}
