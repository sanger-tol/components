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
  const [selectedConditionParam, setSelectedConditionParam] = useState<string | undefined>();

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
    }
    setSelectedConditionParam(undefined);
  }, [open]);

  const onTypeChange = (type: string) => {
    setRenderer(
      type === "none" ? null : // forces no renderer
        { ...renderer, type: type, props: {} }
    );
  };

  const onConditionSave = (filters: IFilter) => {
    renderer!.props![selectedConditionParam!] = filters;
    setRenderer({ ...renderer! });
    setSelectedConditionParam(undefined);
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
    <Button
      icon="check"
      position="right"
      type="success"
      onClick={() => {
        setOpen(false), onSave(renderer, attributeId);
      }}
      text="Apply"
      disabled={
        renderer !== null &&
        !renderer?.type ||
        requiredParamsCount > filledParamsCount
      }
    />
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
      size={selectedConditionParam ? "sm" : "xs"}
      closeButton={!selectedConditionParam}
      actionButton={selectedConditionParam ? undefined : Buttons}
    >
      {!selectedConditionParam ? (
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
      ) : <></>}
      {selectedConditionParam ? (
        <div className="tol-cell-renderer-modal-condition-params">
          <div className="tol-param-header">
            <h6 className="tol-param-title">
              Configure Condition for
              '{cellRendererParams[renderer?.type!][selectedConditionParam]?.rename}'
              Parameter
            </h6>
            <Button
              outline
              type="warning"
              text="Return"
              icon="arrow-right"
              onClick={() => setSelectedConditionParam(undefined)}
              position="right"
            />
          </div>
          <RemoteFilters
            {...props}
            filters={renderer?.props?.[selectedConditionParam!] as IFilter || { and_: {} }}
            onSave={onConditionSave}
            onSaveText="Update Condition"
          />
        </div>
      ) : (
        <>
          {renderer &&
            Object.keys(cellRendererParams[renderer?.type] || {}).length > 0 && (
              <div className="tol-cell-renderer-modal-params">
                {Object.entries(cellRendererParams[renderer.type]).map(([param, meta]) => {
                  return (
                    <CellRendererParam
                      {...props}
                      key={param}
                      param={param}
                      meta={meta}
                      renderer={renderer}
                      setRenderer={setRenderer}
                      selectedConditionParam={selectedConditionParam}
                      setSelectedConditionParam={setSelectedConditionParam}
                    />
                  )
                })}
              </div>
            )}
        </>
      )}
    </Modal>
  )
}
