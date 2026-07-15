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
  TAutoCompleteValue,
} from "..";

export interface PRemoteAutoComplete
  extends Omit<PAutoComplete, "onChange">,
    IRemoteTarget {
  value: string;
  onChange?: (value: TAutoCompleteValue) => void;
  displayFields?: string[];
  displayFieldsTitle?: boolean;
  searchBy: string;
}

export function RemoteAutoComplete(props: PRemoteAutoComplete) {
  const { onChange, dataSource, objectType, displayFields = [], searchBy } = props;
  const [filteredData, setFilteredData] = useState<IRemoteAutoCompleteData>({});
  const [loading, setLoading] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueIDRef = useRef<string | undefined>(undefined);

  const handleChange = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Always propagate value changes immediately (no ID yet)
    onChange?.({ value, id: undefined });

    // Stops API getting everything when value is empty
    if (value === "") {
      setFilteredData({});
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await dataSource.getList({
          objectType,
          filter: {
            and_: {
              [searchBy]: {
                contains: { value },
              },
            },
          },
        });

        const newData: Record<string, any> = {};
        let matchedId: string | undefined = undefined;

        data?.forEach((item: any) => {
          if (item[searchBy] === value) {
            matchedId = item.id;
          }
          newData[item[searchBy]] = displayFields.map(
            (field: string) => ({ [field]: item[field] })
          );
        });

        // update the ref so we keep track of the matched ID
        valueIDRef.current = matchedId;
        setFilteredData(newData);

        // Notify parent of resolved ID
        if (matchedId) {
          onChange?.({ value, id: matchedId });
        }
      } catch (err) {
        console.error("RemoteAutoComplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };


  return (
    <div>
      <AutoComplete
        {...props}
        onChange={handleChange}
        data={Object.keys(filteredData)}
        value={props.value}
        loading={loading}
        displayFields={filteredData}
      />
    </div>
  );
}
