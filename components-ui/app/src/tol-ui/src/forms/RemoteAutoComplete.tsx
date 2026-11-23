/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState, useRef, ReactNode } from "react";
import { AutoComplete, mergeFilters, Loader } from "..";
import type {
  IRemoteTarget,
  IRemoteAutoCompleteData,
  TAutoCompleteValue,
  TFormRemoteAutoCompleteField,
  ListGetter,
  IFilter
} from "..";

export interface PRemoteAutoComplete
  extends TFormRemoteAutoCompleteField, IRemoteTarget<ListGetter> {
  /**
  * The current value of the autocomplete input field.
  */
  value: TAutoCompleteValue;
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
  /**
   * The filter to apply when querying the remote data source.
   */
  filter?: IFilter;
  /**
   * The element to render when a choice is made in the autocomplete.
   */
  RenderOnChoice?: (data: any) => ReactNode;
}

export function RemoteAutoComplete(props: PRemoteAutoComplete) {
  const {
    onChange,
    dataSource,
    objectType,
    searchBy,
    RenderOnChoice
  } = props;
  const searchValue = typeof props.value === "string" ? props.value : props.value?.value ?? "";
  const [filteredData, setFilteredData] = useState<IRemoteAutoCompleteData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>();
  // This state and RenderOnChoice are mostly needed for when this is being used in the Forms
  // to render additional elements. It cannot be done in the form itself due to not being able to access
  // the filtered data directly.
  const [renderExtraElement, setRenderExtraElement] = useState<boolean>(false);

  const requestIdRef = useRef<number>(0);
  const pendingValueRef = useRef<string | undefined>(undefined);
  const lookupPropsRef = useRef(props);
  lookupPropsRef.current = props;

  const handleChange = (value: string) => {
    ++requestIdRef.current;
    pendingValueRef.current = value;
    setSelectedValue(previous => previous === value ? previous : undefined);
    setRenderExtraElement(false);
    onChange?.({ value, id: undefined });
  };

  useEffect(() => {
    const value = searchValue;
    const requestId = ++requestIdRef.current;
    setRenderExtraElement(false);

    if (value === "") {
      setFilteredData({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const { displayFields = [], filter, returnFields, setReturnedValues } = lookupPropsRef.current;
      try {
        const mergedFilter = mergeFilters({
          and_: {
            [searchBy]: {
              contains: { value },
            },
          }
        }, filter);
        const data = await dataSource.getList({
          objectType,
          filter: mergedFilter,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

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

        setFilteredData(displayData);
        setRenderExtraElement(Object.keys(displayData).length === 1);

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
        if (matchedId && pendingValueRef.current === value) {
          pendingValueRef.current = undefined;
          lookupPropsRef.current.onChange?.({ value, id: matchedId });
        }
      } catch (err) {
        console.error("RemoteAutoComplete error:", err);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      ++requestIdRef.current;
    };
  }, [searchValue, dataSource, objectType, searchBy]);

  return (
    <div>
      <AutoComplete
        {...props}
        onChange={handleChange}
        onSelect={setSelectedValue}
        data={Object.keys(filteredData)}
        value={props.value}
        loading={loading}
        displayFields={filteredData}
      />
      {RenderOnChoice && (loading
        ? selectedValue === searchValue && <div className="tol-autocomplete-loader">
          <Loader />
        </div>
        : renderExtraElement && RenderOnChoice(filteredData[Object.keys(filteredData)[0]][0]))}
    </div>
  );
}
