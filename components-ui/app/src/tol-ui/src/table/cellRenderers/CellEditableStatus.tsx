/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import { CellEditableControls, PCellDisplay } from "../..";

/** Props for the editable status cell. */
export interface PCellEditableStatus extends PCellDisplay {
  /** Whether a save operation is in progress. */
  loading: boolean;
  /** Whether the Save and Cancel controls should use floating positioning. */
  floatingControls?: boolean;
  /**
   * The object type of the status-type lookup table,
   * e.g. "metagenome_status_type".
   */
  statusTypeObjectType: string;
  /** Called when editing is cancelled. */
  onCancel: () => void;
  /** Called with the selected status ID when saving. */
  onSave: (selectedStatusTypeId: string) => void;
}

/**
 * Editable cell for fields with `acts_as === "status"`.
 * Fetches options from the status-type lookup table and presents them
 * as a searchable dropdown. On save, calls `onSave` with the selected ID
 * so the caller can dispatch the appropriate action.
 */
export function CellEditableStatus(props: PCellEditableStatus) {
  const {
    dataSource,
    loading,
    floatingControls,
    statusTypeObjectType,
    value,
    onCancel,
    onSave,
  } = props;

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
      <CellEditableControls
        loading={loading}
        saveDisabled={!selected}
        floatingControls={floatingControls}
        onCancel={onCancel}
        onSave={() => selected && onSave(selected)}
      />
    </>
  );
}
