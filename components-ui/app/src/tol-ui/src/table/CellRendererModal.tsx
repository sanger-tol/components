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
  IEntityMeta,
  IRemoteTarget,
  InfoTooltip,
} from "..";


export interface PCellRendererModal extends IRemoteTarget {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta,
  onSave: (renderer: TCellRenderer, attributeId: string) => void,
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId, fieldMeta, objectType, dataSource, onSave } = props;
  const [renderer, setRenderer] = useState<TCellRenderer>();
  const [entityMeta, setEntityMeta] = useState<IEntityMeta>();

  useEffect(() => {
    dataSource
      .getEntityMeta().then((em) => {
        setEntityMeta(em);
      });
  }, []);

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
      {
        ` '${entityMeta?.flatAttributes[objectType][attributeId].display_name
        || normaliseCaps(attributeId)}' `
      }
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
      <div className="tol-cell-renderer-modal-selector">
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
      </div>
      <div className="tol-cell-renderer-modal-params">
        {/* Extra options depending on the value selected */}
        {renderer && cellRendererParams[renderer.type as string] &&
          Object.entries(cellRendererParams[renderer.type as string]).map(([param, values]) => {
            return (
              <div key={param}>
                <span className="tol-param-title">
                  {values.rename}:
                </span>
                {values.required &&
                  <span className="tol-param-required">*</span>
                }
                <span className="tol-param-info">
                  <InfoTooltip contents={values.description} disableMarkdown />
                </span>
                <div className="tol-param">
                  {values.type === "string" ? (
                    <Input
                      value={renderer.props![param]}
                      onChange={(newValue: string) => {
                        renderer.props![param] = newValue;
                        setRenderer({ ...renderer });
                      }}
                    />
                  ) : values.type === "boolean" ? (
                    <Button text="Add text field" />
                  ) : null}
                </div>
              </div>
            )
          })
        }
      </div>
    </Modal>
  )
}
