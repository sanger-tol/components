/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef } from "react";
import { AutoComplete } from "..";
import type {
  IRemoteTarget,
  IRemoteAutoCompleteData,
  TAutoCompleteValue,
  TFormRemoteAutoCompleteField,
} from "..";

export interface PRemoteAutoComplete
  extends TFormRemoteAutoCompleteField, IRemoteTarget {
  /**
  * The current value of the autocomplete input field.
  */
  value: string;
  /**
   * Callback function that is called when the value of the autocomplete input field changes.
   */
  onChange?: (value: TAutoCompleteValue) => void;
  /**
   * The fields to display in the autocomplete dropdown.
   */
  displayFields?: string[];
  /**
   * Whether to display the titles of the fields in the autocomplete dropdown.
   */
  displayFieldsTitle?: boolean;
  /**
   * The field to search by in the remote data source.
   */
  searchBy: string;
  /**
   * Callback function to set the returned values from the remote data source.
   */
  setReturnedValues?: (data: IRemoteAutoCompleteData) => void;
  /**
   * The fields to return from the remote data source.
   */
  returnFields?: string[];
}

export function RemoteAutoComplete(props: PRemoteAutoComplete) {
  const {
    onChange,
    dataSource,
    objectType,
    displayFields = [],
    searchBy,
    setReturnedValues,
    returnFields,
  } = props;
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

        const displayData: Record<string, any> = {};
        let matchedId: string | undefined = undefined;

        data?.forEach((item: any) => {
          if (item[searchBy] === value) {
            matchedId = item.id;
          }
          displayData[item[searchBy]] = displayFields.map((field: string) => ({
            [field]: item[field],
          }));
        });

        // update the ref so we keep track of the matched ID
        valueIDRef.current = matchedId;
        setFilteredData(displayData);

        // This returns the fields specified in returnFields for each item in the filtered data
        if (setReturnedValues && returnFields) {
          const returnData: Record<string, any> = {};
          data?.forEach((item: any) => {
            returnFields?.forEach((field: string) => {
              if (!returnData[item[searchBy]]) {
                returnData[item[searchBy]] = {};
              }
              returnData[item[searchBy]][field] = item[field];
            });
          });
          setReturnedValues?.(returnData);
        }

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
