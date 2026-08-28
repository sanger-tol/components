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
  PopUpMessage,
  useAuth,
} from "../..";


/**
 * Editable cell for fields with `acts_as === "status"`.
 * Fetches options from the status-type lookup table and presents them
 * as a searchable dropdown. On save, calls `onSave` with the selected ID
 * so the caller can dispatch the appropriate action.
 */
export function CellEditableStatus(props: PCellEditableInput) {
  const {
    value,
    setValue,
    onSaveSuccess,
    onSaveError,
    dataSource,
    dataObject,
    loading,
    setLoading,
    floatingControls,
    onCancel,
    parentDataObject,
  } = props;

  /**
  * The object type of the status-type lookup table,
  * e.g. "metagenome_status_type".
  */
  const statusTypeObjectType = (dataObject as IDataObject).objectType

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
      .getListPage({ objectType: statusTypeObjectType })
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
  }, [dataSource, initialValue, statusTypeObjectType]);

  const onSave = (selectedStatusTypeId: string) => {
    if (selectedStatusTypeId == value) {
      PopUpMessage({ type: "success", message: "Status updated successfully." })
      onCancel();
      return;
    }

    if (!dataObject) return;
    setLoading(true);

    dataSource
      .custom({
        method: API_METHODS.POST,
        resource: `${parentDataObject?.objectType}${API_OPERATIONS.ACTION}`,
        body: {
          ids: [parentDataObject?.id],
          action_name: "SetStatusAction",
          object_type: parentDataObject?.objectType,
          params: { status: selectedStatusTypeId, user_id: user?.id },
        },
      })
      .then(() => {
        setValue(selectedStatusTypeId);
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
