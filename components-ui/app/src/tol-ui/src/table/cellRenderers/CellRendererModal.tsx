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
  isEmptyObject,
  BUTTONS,
  isObjectEqual,
} from "../..";
import { CellRendererParam } from "./CellRendererParam";


export interface PCellRendererModal extends IRemoteTarget {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  attributeId: string,
  fieldMeta: FieldMeta,
  setFieldMeta: (fieldMeta: FieldMeta) => void,
}

export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, attributeId, fieldMeta, setFieldMeta, objectType, dataSource } = props;
  const [renderer, setRenderer] = useState<TCellRenderer>();
  const [previousRenderer, setPreviousRenderer] = useState<TCellRenderer>();
  const [entityMeta, setEntityMeta] = useState<IEntityMeta>();
  const [selectedConditionParam, setSelectedConditionParam] = useState<string | undefined>();
  const [filterConditions, setFilterConditions] = useState<IFilter>();
  const [conditionHasPendingChanges, setConditionHasPendingChanges] = useState<boolean>(false);

  const requiredParamKeys = renderer && cellRendererParams[renderer.type]
    ? Object.entries(cellRendererParams[renderer.type].params || {})
      .filter(([_, v]) => v.required)
      .map(([k, _]) => k)
    : [];
  const requiredParamsCount = requiredParamKeys.length;
  const filledParamsCount = requiredParamKeys.filter(key => {
    return renderer?.props && renderer.props[key];
  }).length;

  const rendererHasPendingChanges = (
    !isObjectEqual(renderer || {}, previousRenderer || {})
  );

  useEffect(() => {
    dataSource
      .getEntityMeta().then((em) => {
        setEntityMeta(em);
      });
  }, []);

  useEffect(() => {
    if (open) {
      setRenderer(
        deepCopy(
          fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer
        )
      );
      setPreviousRenderer(
        deepCopy(
          fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer
        )
      );
    }
    setSelectedConditionParam(undefined);
  }, [open]);

  const onTypeChange = (type: string) => {
    setRenderer(
      type ? { ...renderer, type: type, props: {} } : undefined // TODO: props needed?
    );
  };

  const onAddNewRenderer = () => {
    if (renderer) {
      fieldMeta.data![attributeId] = fieldMeta.data![attributeId] || {};
      fieldMeta.data![attributeId].cellRenderer = renderer;
      fieldMeta.dataWithDefaults![attributeId] = fieldMeta.dataWithDefaults![attributeId] || {};
      fieldMeta.dataWithDefaults![attributeId].cellRenderer = renderer;
    } else {
      delete fieldMeta.data![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.data![attributeId])) {
        delete fieldMeta.data![attributeId];
      }
      delete fieldMeta.dataWithDefaults![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.dataWithDefaults![attributeId])) {
        delete fieldMeta.dataWithDefaults![attributeId];
      }
    }
    setFieldMeta({ ...fieldMeta! });
    setOpen(false);
  }

  const onConditionSave = () => {
    // delete empty params if no condition present
    if (isEmptyObject(filterConditions?.and_ || {})) {
      delete renderer!.props![selectedConditionParam!];
    } else {
      renderer!.props![selectedConditionParam!] = filterConditions ?? {};
    }
    setRenderer({ ...renderer! });
    setSelectedConditionParam(undefined);
    setConditionHasPendingChanges(false);
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

  const SaveCellRendererButton = (
    <Button
      {...BUTTONS.ADD}
      position="right"
      disabled={!rendererHasPendingChanges || requiredParamsCount > filledParamsCount}
      onClick={onAddNewRenderer}
    />
  );

  const ConditionButtons = (
    <>
      <Button
        {...BUTTONS.ADD}
        position="right"
        disabled={!conditionHasPendingChanges}
        onClick={onConditionSave}
      />
      <Button
        {...BUTTONS.RETURN}
        position="left"
        onClick={() => setSelectedConditionParam(undefined)}
      />
    </>
  );

  const typeChoices = Object.keys(cellRendererParams)
    .filter(cellRendererType => {
      const allowed = cellRendererParams[cellRendererType]?.allowedDataTypes;
      const attrType = fieldMeta?.dataWithDefaults?.[attributeId]?.type;
      // if allowedDataTypes is not defined, allow all
      if (!allowed) return true;
      return allowed.includes(attrType!);
    })
    .map(cellRendererType => ({
      label: cellRendererParams[cellRendererType]?.rename || normaliseCaps(cellRendererType),
      value: cellRendererType
    }));

  return (
    <Modal
      header={Header}
      open={open}
      setOpen={setOpen}
      size={selectedConditionParam ? "sm" : "xs"}
      closeButton={!selectedConditionParam}
      actionButton={selectedConditionParam ? undefined : SaveCellRendererButton}
      hasPendingChanges={rendererHasPendingChanges || conditionHasPendingChanges}
    >
      {!selectedConditionParam ? (
        <div className="tol-cell-renderer-modal-selector">
          <SingleSelect
            block
            placeholder="Default Cell Renderer"
            value={
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
              '{cellRendererParams[renderer?.type!].params?.[selectedConditionParam]?.rename}'
              Parameter
            </h6>
          </div>
          <RemoteFilters
            {...props}
            filters={renderer?.props?.[selectedConditionParam!] as IFilter}
            setFilters={setFilterConditions}
            open={open}
            setHasPendingChanges={setConditionHasPendingChanges}
          />
          {ConditionButtons}
        </div>
      ) : (
        <>
          {renderer &&
            Object.keys(cellRendererParams[renderer?.type]?.params || {}).length > 0 && (
              <div className="tol-cell-renderer-modal-params">
                {Object.entries(cellRendererParams[renderer.type].params || {}).map(([param, meta]) => {
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
