/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import { Button, BUTTONS, PCellDisplay } from "../..";

const MAX_RELATIONSHIP_CARDINALITY = 250;

export interface PCellEditableRelationship extends PCellDisplay {
  loading: boolean;
  floatingControls?: boolean;
  onCancel: () => void;
  onSave: (selectedId: string) => void;
}

interface IRelationshipOption {
  label: string;
  value: string;
}

export function CellEditableRelationship(props: PCellEditableRelationship) {
  const {
    dataObject,
    dataSource,
    loading,
    floatingControls,
    value,
    cardinality,
    onCancel,
    onSave,
  } = props;

  const [options, setOptions] = useState<IRelationshipOption[]>([]);
  const [selected, setSelected] = useState<string | null>(
    typeof value === "string" ? value : null,
  );
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    setSelected(typeof value === "string" ? value : null);
  }, [value]);

  useEffect(() => {
    let cancelled = false;

    if (!cardinality || cardinality > MAX_RELATIONSHIP_CARDINALITY) {
      setLoadingOptions(false);
      return () => {
        cancelled = true;
      };
    }

    dataSource
      .getList({ objectType: dataObject?.objectType ?? "" })
      .then((items) => {
        if (cancelled) return;
        setOptions(
          (items ?? [])
            .filter((item) => item)
            .map((item) => ({ label: item!.id, value: item!.id })),
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cardinality, dataObject?.objectType, dataSource]);

  return (
    <>
      <SelectPicker
        block
        data={options}
        value={selected}
        loading={loadingOptions}
        cleanable={false}
        onChange={(nextValue) =>
          setSelected(typeof nextValue === "string" ? nextValue : null)
        }
      />
      <div
        className={`tol-data-point-editable-controls${floatingControls ? " floating" : ""}`}
      >
        <Button {...BUTTONS.CANCEL} disabled={loading} onClick={onCancel} />
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