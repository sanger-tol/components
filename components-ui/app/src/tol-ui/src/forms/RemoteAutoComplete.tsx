/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from "react";
import {
  TsDataSource,
  AutoComplete,
  PAutoComplete,
} from "..";

export interface PRemoteAutoComplete extends PAutoComplete {
  datasource: TsDataSource;
  objectType: string;
  label?: string;
  data: string[];
  value: string;
  onChange?: any;
  displayFields: string[];
  searchBy: string;
}

export function RemoteAutoComplete(props: PRemoteAutoComplete) {
  const { onChange, datasource, objectType, displayFields, searchBy } = props;
  const [filteredData, setFilteredData] = useState<string[]>([]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = async(value: string) => {

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (onChange) {
      onChange(value);
    }
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

        setFilteredData(
          data!.map((item: any) => item[displayFields[0]])
        );
      }, 300);
    } else {
      setFilteredData([]);
    }
  }

  return (
    <div>
      <AutoComplete
        onChange={handleChange}
        label={props.label}
        data={filteredData}
        value={props.value}
      />
    </div>
  );
}