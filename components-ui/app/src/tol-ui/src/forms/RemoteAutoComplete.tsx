/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from "react";
import {
  AutoComplete,
  PAutoComplete,
  IRemoteTarget,
  IRemoteAutoCompleteData,
} from "..";

export interface PRemoteAutoComplete extends PAutoComplete, IRemoteTarget {
  label: string;
  data: string[];
  value: string;
  onChange?: any;
  displayFields?: string[];
  displayFieldsTitle?: boolean;
  searchBy: string;
}

export function RemoteAutoComplete(props: PRemoteAutoComplete) {
  const { onChange, dataSource, objectType, displayFields = [], displayFieldsTitle, searchBy } = props;
  const [filteredData, setFilteredData] = useState<IRemoteAutoCompleteData>({});
  const [loading, setLoading] = useState<boolean>(false);

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
        setLoading(true);
        const data = await dataSource.getList({
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
          newData[item[searchBy]] = displayFields.map((field: string) => ({ [field]: item[field] }));
        })
        console.log(newData);
        setFilteredData(newData);
        setLoading(false);
      }, 400);
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
        displayFieldsTitle={displayFieldsTitle}
        loading={loading}
      />
    </div>
  );
}
