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
  CellRendererParam,
  Button,
  deepCopy,
  TCellRenderer,
  IRemoteTarget,
  isEmptyObject,
  BUTTONS,
  AttributeTitle,
} from "../..";
import { ConditionParamScreen } from "./ConditionParamScreen";


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
  const [selectedParam, setSelectedParam] = useState<string | undefined>();
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
    JSON.stringify(renderer) !== JSON.stringify(previousRenderer)
  );

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
    setSelectedParam(undefined);
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

  const Header = (
    <>
      <h5>
        Configure Cell Renderer for
        <AttributeTitle
          objectType={objectType}
          dataSource={dataSource}
          attributeId={attributeId}
        />
      </h5>
      <p>
        Please be aware that the selected Cell Renderer works on a current Data Object.
      </p>
    </>
  );

  const SaveCellRendererButton = (
    <Button
      {...BUTTONS.ADD}
      disabled={!rendererHasPendingChanges || requiredParamsCount > filledParamsCount}
      onClick={onAddNewRenderer}
    />
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
      size={selectedParam ? "sm" : "xs"}
      closeButton={!selectedParam}
      actionButton={selectedParam ? undefined : SaveCellRendererButton}
      hasPendingChanges={rendererHasPendingChanges || conditionHasPendingChanges}
    >
      {!selectedParam ? (
        <div className="tol-data-point-renderer-modal-selector">
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
      {selectedParam && renderer ? (
        <ConditionParamScreen
          {...props}
          selectedParam={selectedParam}
          setSelectedParam={setSelectedParam}
          renderer={renderer}
          setRenderer={setRenderer}
          previousRenderer={previousRenderer}
          onPendingChangesChange={setConditionHasPendingChanges}
        />
      ) : (
        <>
          {renderer &&
            Object.keys(cellRendererParams[renderer?.type]?.params || {}).length > 0 && (
              <div className="tol-data-point-renderer-modal-params">
                {Object.entries(cellRendererParams[renderer.type].params || {}).map(([param, meta]) => {
                  return (
                    <CellRendererParam
                      {...props}
                      key={param}
                      param={param}
                      meta={meta}
                      renderer={renderer}
                      setRenderer={setRenderer}
                      selectedParam={selectedParam}
                      setSelectedParam={setSelectedParam}
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
