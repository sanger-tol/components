/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction } from "react";
import { Input } from "rsuite";
import {
  FieldMeta,
  TCellRendererType,
  CellRendererType,
  SingleSelect,
  Modal,
  normaliseCaps,
  cellRendererParams,
  TBoardParams,
  Button,
  deepCopy,
} from "..";


interface PCellRendererModal {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId, fieldMeta } = props;
  const [renderer, setRenderer] = useState({
    props: {},
    ...deepCopy(fieldMeta.dataWithDefaults[attributeId].cellRenderer),
  });

  function saveRendererProps() {
    alert(`FOR FIELD ${attributeId}, WE SAVE THE FOLLOWING PROPS:\n\n${JSON.stringify(renderer.props, null, 4)}`);
  }

  const Header = <h5>Configure Cell Renderer: {attributeId}</h5>;

  const Buttons = (
    <div>
      <Button
        position="right"
        type="success"
        onClick={() => {
          setOpen(false), saveRendererProps();
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
        value={renderer.type}
        setValue={(newType) => setRenderer({ ...renderer, type: newType, props: {} })}
        data={CellRendererType.map(cellRendererType => ({
          label: normaliseCaps(cellRendererType),
          value: cellRendererType
        }))}
      />

      {/* Extra options depending on the value selected */}
      {
        cellRendererParams[renderer.type] &&
          Object.entries(cellRendererParams[renderer.type]).map(([param, values]) => {
            switch (values.type) {
              case "string":
                return (
                  <>
                    {values.rename}:
                    <Input
                      value={renderer.props[param]}
                      onChange={(newValue) => {
                        renderer.props[param] = newValue;
                        setRenderer({...renderer});
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
                return "";
            }
          })
      }
    </Modal>
  )
}
