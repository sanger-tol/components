/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import {
  Button,
  BUTTONS,
  IDataObject,
  PCellEditableInput,
} from "../..";


/**
 * Editable cell for fields with `acts_as === "status"`.
 * Fetches options from the status-type lookup table and presents them
 * as a searchable dropdown. On save, calls `onSave` with the selected ID
 * so the caller can dispatch the appropriate action.
 */
export function CellEditableStatus(props: PCellEditableInput) {
  const {
    dataSource,
    dataObject,
    loading,
    floatingControls,
    value,
    onCancel,
  } = props;

  /**
   * The object type of the status-type lookup table,
   * e.g. "metagenome_status_type".
   */
  const statusTypeObjectType = (dataObject as IDataObject).objectType

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
      <div
        className={`tol-data-point-editable-controls${floatingControls ? " floating" : ""}`}
      >
        <Button
          {...BUTTONS.CANCEL}
          disabled={loading}
          onClick={onCancel}
        />
        <Button
          {...BUTTONS.SAVE}
          disabled={loading || !selected}
          loading={loading}
          onClick={() => selected && onSave(selected)}
        />
      </div>
    </>
  );
}

  // const onSaveStatus = (selectedStatusTypeId: string) => {

  //   if (selectedStatusTypeId == value) {
  //     PopUpMessage({ type: "success", message: "Status updated successfully." })
  //     setEditMode(false);
  //     return;
  //   }

  //   if (!dataObject) return;
  //   setLoading(true);

  //   const user = getUserFromLocalStorage();
  //   dataSource
  //     .custom({
  //       method: API_METHODS.POST,
  //       resource: `${parentDataObject?.objectType}${API_OPERATIONS.ACTION}`,
  //       body: {
  //         ids: [parentDataObject?.id],
  //         action_name: "SetStatusAction",
  //         object_type: parentDataObject?.objectType,
  //         params: { status: selectedStatusTypeId, user_id: user?.id },
  //       },
  //     })
  //     .then(() => {
  //       setEditMode(false);
  //       PopUpMessage({ type: "success", message: "Status updated successfully." });
  //       setValue(selectedStatusTypeId);
  //       setHasChanged(true);
  //     })
  //     .catch((error: any) => {
  //       PopUpMessage({ type: "error", message: `Error saving: ${error.message}` });
  //       setEditMode(false);
  //     })
  //     .finally(() => {
  //       setLoading(false)
  //     });
  // };