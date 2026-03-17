/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import {
  Button,
  BUTTONS,
  PCellDisplay,
} from "../..";


export interface PCellEditableStatus extends PCellDisplay {
  loading: boolean;
  floatingControls?: boolean;
  /**
   * The object type of the status-type lookup table,
   * e.g. "metagenome_status_type".
   */
  statusTypeObjectType: string;
  onCancel: () => void;
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
    onCancel,
    onSave,
  } = props;

  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    dataSource
      .getListPage({ objectType: statusTypeObjectType })
      .then((items: any) => {
        setOptions(
          (items ?? []).map((item: any) => ({
            label: item.id,
            value: item.id,
          }))
        );
      })
      .finally(() => setLoadingOptions(false));
  }, [statusTypeObjectType]);

  return (
    <>
      <SelectPicker
        autoFocus
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
