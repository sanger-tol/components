/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { Input } from "rsuite";
import {
  FieldMeta,
  CellRendererType,
  SingleSelect,
  Modal,
  normaliseCaps,
  cellRendererParams,
  Button,
  deepCopy,
  TCellRenderer,
} from "..";


export interface PCellRendererModal {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta,
  onSave: (renderer: TCellRenderer, attributeId: string) => void,
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId, fieldMeta, onSave } = props;
  const [renderer, setRenderer] = useState<TCellRenderer>();

  useEffect(() => {
    if (open) {
      setRenderer(
        fieldMeta?.dataWithDefaults?.[attributeId]?.cellRenderer === null ? null :
        fieldMeta?.dataWithDefaults?.[attributeId]?.cellRenderer === undefined ? undefined :
        deepCopy(
          fieldMeta?.dataWithDefaults?.[attributeId]?.cellRenderer as object
        )
      );
    }
  }, [open]);

  const onTypeChange = (type: string) => {
    setRenderer(
      type === "none" ? null : // forces no renderer
        { ...renderer, type: type, props: {} }
    );
  };

  const Header = (
    <h5>
      Configure
      <span
        style={{
          color: "var(--tol-primary)",
          marginLeft: 5,
          marginRight: 5
        }}
      >
        {fieldMeta.dataWithDefaults?.[attributeId].rename}
      </span>
      Cell Renderer
    </h5>
  );

  const Buttons = (
    <div>
      <Button
        position="right"
        type="success"
        onClick={() => {
          setOpen(false), onSave(renderer, attributeId);
        }}
        text="Update"
      />
      <Button
        position="right"
        type="error"
        onClick={() => setOpen(false)}
        text="Cancel"
      />
    </div>
  );

  const typeChoices = [
    "none", ...CellRendererType
  ].map(cellRendererType => ({
    label: normaliseCaps(cellRendererType),
    value: cellRendererType
  }));

  return (
    <Modal
      header={Header}
      open={open}
      setOpen={setOpen}
      size="sm"
      closeButton={false}
      actionButton={Buttons}
    >
      <SingleSelect
        block
        placeholder="Default Cell Renderer"
        value={
          renderer === null ? "none" :
            renderer?.type as string || ""
        }
        onChange={onTypeChange}
        data={typeChoices}
      />

      <>
        {/* Extra options depending on the value selected */}
        {renderer && cellRendererParams[renderer.type as string] &&
          Object.entries(cellRendererParams[renderer.type as string]).map(([param, values]) => {
            switch (values.type) {
              case "string":
                return (
                  <span key={param} style={{marginTop: 10}}>
                    {values.rename}:
                    <Input
                      value={renderer.props![param]}
                      onChange={(newValue: string) => {
                        renderer.props![param] = newValue;
                        setRenderer({ ...renderer });
                      }}
                    />
                  </span>
                )
              case "boolean":
                return (
                  <span key={param} style={{marginTop: 10}}>
                    {values.rename}:
                    <Button text="Add text field" />
                  </span>
                )
              default:
                return <></>;
            }
          })
        }
      </>
    </Modal>
  )
}
