/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { isEmptyObject, stopPropagation } from "../general/utils";
import { MultipleSelect } from "../forms/MultipleSelect";
import { useEffectUpdate } from "../hooks/useEffectUpdate";

interface Props {
  id: string;
  rename: string;
  filter: object;
  setFilter: any;
}

export function FilterBooleanPicker(props: Props) {
  const { id, rename, filter, setFilter } = props;
  const filterType: string = "in_list";
  const [value, setValue] = useState<any>([]);

  // altering filter value if the attribute is filtered on else where
  useEffectUpdate(() => {
    if (filterType in filter && id in filter[filterType]) {
      // needs converting back to value state (how rsuite wants it)
      const filterValue = convertValues(filter[filterType][id]);
      if (JSON.stringify(value) !== JSON.stringify(filterValue)) {
        setValue(filterValue);
      }
    } else {
      setValue([]);
    }
  }, [filter]);

  // opposites are used as this func is used in 2 places
  const convertValues = (values: string[]) => {
    const convertedValues: string[] = [];
    for (const value of values) {
      switch (value) {
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

  const onFilter = (input: string[]) => {
    // update input value
    setValue(input);
    // input removed
    if (input.length === 0) {
      delete filter[filterType][id];
      // delete filter type if object is empty
      if (isEmptyObject(filter[filterType])) {
        delete filter[filterType];
      }
    } else {
      // if filter type not created
      if (!(filterType in filter)) {
        filter[filterType] = {};
      }
      filter[filterType][id] = convertValues(input);
    }
    setFilter({ ...filter });
  };

  return (
    <span onClick={stopPropagation}>
      <MultipleSelect
        block
        data={["True", "False"]}
        placeholder={rename}
        value={value}
        setValue={onFilter}
      />
    </span>
  );
}
