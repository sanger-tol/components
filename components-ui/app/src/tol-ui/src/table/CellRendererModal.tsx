/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction } from "react";
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
  ICellRenderer,
} from "..";


export interface PCellRendererModal {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta
  onSave: (renderer: ICellRenderer, attributeId: string) => void
}
// RESET CELL RENDERERS ON CLOSE
export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId, fieldMeta, onSave } = props;
  const [renderer, setRenderer] = useState<ICellRenderer>({
    props: {},
    ...deepCopy(
      fieldMeta?.dataWithDefaults?.[attributeId]?.cellRenderer as object || {}
    ),
  });

  const Header = <h5>Configure Cell Renderer: {attributeId}</h5>;

  const Buttons = (
    <div>
      <Button
        position="right"
        type="success"
        onClick={() => {
          setOpen(false), onSave(renderer, attributeId);
        }}
        text="Confirm"
      />
      <Button
        position="right"
        type="error"
        onClick={() => setOpen(false)}
        text="Cancel"
      />
    </div>
  );

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
        value={renderer.type as string}
        setValue={(newType) => setRenderer({ ...renderer, type: newType, props: {} })}
        data={CellRendererType.map(cellRendererType => ({
          label: normaliseCaps(cellRendererType),
          value: cellRendererType
        }))}
      />

      <>
        {/* Extra options depending on the value selected */}
        {
          cellRendererParams[renderer.type as string] &&
          Object.entries(cellRendererParams[renderer.type as string]).map(([param, values]) => {
            switch (values.type) {
              case "string":
                return (
                  <>
                    {values.rename}:
                    <Input
                      value={renderer.props![param]}
                      onChange={(newValue) => {
                        renderer.props![param] = newValue;
                        setRenderer({ ...renderer });
                      }}
                    />
                  </>
                )
              case "boolean":
                return (
                  <>
                    {values.rename}:
                    <Button text="Add text field" />
                  </>
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
