/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from "react";
import {
  AutoComplete,
  PAutoComplete,
  IRemoteTarget,
} from "..";

export interface PRemoteAutoComplete extends PAutoComplete, IRemoteTarget {
  label?: string;
  data: string[];
  value: string;
  onChange?: any;
  displayFields?: string[];
  searchBy: string;
}

export function RemoteAutoComplete(props: PRemoteAutoComplete) {
  const { onChange, datasource, objectType, displayFields = [], searchBy } = props;
  const [filteredData, setFilteredData] = useState<object>({});


  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = async (value: string) => {

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (onChange) {
      onChange(value);
    }
    // Stops API getting everything when value is empty
    if (value !== "") {
      timeoutRef.current = setTimeout(async () => {
        const data = await datasource.getList({
          objectType,
          filter: {
            and_: {
              [searchBy]: {
                contains: {
                  value: value,
                },
              },
            },
          },
        });
        const newData = {}
        data!.map((item: any) => {
          newData[item[searchBy]] = [...displayFields.map((field: string) => item[field])]
        })
        setFilteredData(newData);
      }, 300);
    } else {
      setFilteredData({});
    }
  }

  return (
    <div>
      <AutoComplete
        onChange={handleChange}
        label={props.label}
        data={Object.keys(filteredData)}
        value={props.value}
        displayFields={filteredData}
      />
    </div>
  );
}