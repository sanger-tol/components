/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import {
  FieldMeta,
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
  IFilter,
  TFilterOrUndefined,
  Icon,
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

  const requiredParamKeys = renderer && cellRendererParams[renderer.type]
    ? Object.entries(cellRendererParams[renderer.type])
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
      setSelectedLogicParam(undefined);
    }
  }, [open]);

  const onTypeChange = (type: string) => {
    setRenderer(
      type === "none" ? null : // forces no renderer
        { ...renderer, type: type, props: {} }
    );
  };

  const onLogicSave = (filters: IFilter) => {
    console.log(filters);
    renderer!.props![selectedLogicParam!] = filters;
    setRenderer({ ...renderer! });
    setSelectedLogicParam(undefined);
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
    "none", ...Object.keys(cellRendererParams)
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
              renderer?.type || ""
          }
          onChange={onTypeChange}
          data={typeChoices}
        />
      </div>
      <>
        {selectedLogicParam ? (
          <div className="tol-cell-renderer-modal-logic-params">
            <h6>
              <Icon
                icon="arrow-left"
                className="tol-return-button"
                onClick={() => setSelectedLogicParam(undefined)}
              />
              Configure Logic for
              '{cellRendererParams[renderer?.type!][selectedLogicParam]?.rename}'
              Parameter
            </h6>
            <RemoteFilters
              {...props}
              filters={renderer?.props?.[selectedLogicParam!] as IFilter || { and_: {} }}
              onSave={onLogicSave}
              onSaveText="Add Logic"
            />
          </div>
        ) : (
          <>
            {renderer &&
              Object.keys(cellRendererParams[renderer?.type] || {}).length > 0 && (
                <div className="tol-cell-renderer-modal-params">
                  <h6>Parameters</h6>
                  {Object.entries(cellRendererParams[renderer.type]).map(([param, meta]) => {
                    return (
                      <CellRendererParam
                        {...props}
                        key={param}
                        param={param}
                        meta={meta}
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
        )}
      </>
    </Modal>
  )
}
