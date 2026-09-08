/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import {
  API_METHODS,
  API_OPERATIONS,
  CellEditableControls,
  IDataObject,
  PCellEditableInput,
  useAuth,
  getRelationshipNameByField,
} from "../..";


export interface PCellEditablePickerWithAction extends PCellEditableInput {
  /** The name of the action to be performed when the status is changed. */
  actionName: string;
}

/**
 * Picker dropdown for editable cells that triggers an action when a selection is made.
 */
export function CellEditablePickerWithAction(props: PCellEditablePickerWithAction) {
  const {
    value,
    setValue,
    dataObject,
    dataSource,
    originDataObject,
    onSaveSuccess,
    onSaveError,
    floatingControls,
    onCancel,
    loading,
    setLoading,
    actionName,
    originField,
  } = props;

  const objectType = (dataObject as IDataObject).objectType

  const { user } = useAuth();

  const initialValue = typeof value === "string" ? value : null;
  const [selected, setSelected] = useState<string | null>(initialValue);
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    setSelected(initialValue);
  }, [initialValue]);

  useEffect(() => {
    dataSource
      .getListPage({ objectType: objectType })
      .then((items: any) => {
        const fetchedOptions = (items ?? []).map((item: any) => ({
          label: item.id,
          value: item.id,
        }));
        if (
          initialValue &&
          !fetchedOptions.some((option) => option.value === initialValue)
        ) {
          fetchedOptions.unshift({
            label: initialValue,
            value: initialValue,
          });
        }
        setOptions(fetchedOptions);
      })
      .finally(() => setLoadingOptions(false));
  }, [dataSource, initialValue, objectType]);

  // Generates the parameters for the action based on the selected value.
  const getActionParams = (selectedValue: string, userId?: string) => {
    if (actionName === "SetStatusAction") {
      return {
        status: selectedValue,
        user_id: userId,
      };
    } else if (actionName === "SetRelationshipAction") {
      return {
        relationship: getRelationshipNameByField(originField),
        related_id: selectedValue,
      };
    }
  };

  const onSave = (selectedValue: string) => {
    if (selectedValue == value) {
      onCancel();
      return;
    }

    if (!dataObject) return;
    setLoading(true);

    dataSource
      .custom({
        method: API_METHODS.POST,
        resource: `${originDataObject?.objectType}${API_OPERATIONS.ACTION}`,
        body: {
          ids: [originDataObject?.id],
          action_name: actionName,
          object_type: originDataObject?.objectType,
          params: getActionParams(selectedValue, user?.id),
        },
      })
      .then(() => {
        setValue(selectedValue);
        onSaveSuccess?.();
      })
      .catch(() => onSaveError?.())
      .finally(() => setLoading(false));
  };

  return (
    <>
      <SelectPicker
        data={options}
        value={selected}
        onChange={(v) => setSelected(v)}
        loading={loadingOptions}
        cleanable={false}
        block
      />
      <CellEditableControls
        floatingControls={floatingControls}
        loading={loading}
        saveDisabled={!selected}
        onCancel={onCancel}
        onSave={() => selected && onSave(selected)}
      />
    </>
  );
}
