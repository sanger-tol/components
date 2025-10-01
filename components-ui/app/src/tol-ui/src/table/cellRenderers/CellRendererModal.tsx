/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction, useEffect } from "react";
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
  RemoteFilters,
  Cell,
} from "../..";
import { CellRendererParam } from "./CellRendererParam";


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
  const [selectedLogicParam, setSelectedLogicParam] = useState<string | undefined>();

  const requiredParamKeys = renderer && cellRendererParams[renderer.type as string]
    ? Object.entries(cellRendererParams[renderer.type as string])
      .filter(([_, v]) => v.required)
      .map(([k, _]) => k)
    : [];
  const requiredParamsCount = requiredParamKeys.length;
  const filledParamsCount = requiredParamKeys.filter(key => {
    return renderer?.props && renderer.props[key];
  }).length;

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

  const onLogicSave = (filters: any) => {
  }

  const Header = (
    <h5>
      Configure
      {
        ` '${entityMeta?.flatAttributes[objectType][attributeId]?.display_name
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
        text="Add"
        disabled={
          renderer !== null &&
          !renderer?.type ||
          requiredParamsCount > filledParamsCount
        }
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
      <>
        {renderer &&
          Object.keys(cellRendererParams[renderer?.type as string] || {}).length > 0 && (
            <div className="tol-cell-renderer-modal-params">
              <h6>Parameters</h6>
              {Object.entries(cellRendererParams[renderer.type as string]).map(([param, values]) => {
                return (
                  <CellRendererParam
                    {...props}
                    key={param}
                    param={param}
                    values={values}
                    renderer={renderer}
                    setRenderer={setRenderer}
                    selectedLogicParam={selectedLogicParam}
                    setSelectedLogicParam={setSelectedLogicParam}
                  />
                )
              })}
            </div>
          )}
      </>
      <>
        {selectedLogicParam && (
          <div className="tol-cell-renderer-modal-logic-param">
            <h6>
              Configure Logic for
              '{cellRendererParams[renderer?.type as string][selectedLogicParam]?.rename}'
              Parameter
            </h6>
            <RemoteFilters
              {...props}
              filters={{}}
              onSave={onLogicSave}
              onSaveText="Add Logic"
            />
          </div>
        )}
      </>
    </Modal>
  )
}
