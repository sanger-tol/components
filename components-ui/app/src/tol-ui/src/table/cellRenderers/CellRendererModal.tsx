/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import {
  AttributeTitle,
  Button,
  BUTTONS,
  CellRendererParamOptions,
  cellRendererParams,
  deepCopy,
  FieldMeta,
  IconTooltip,
  IRemoteTarget,
  Modal,
  normaliseCaps,
  SingleSelect,
  TCellRenderer
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
  const { open, setOpen, objectType, dataSource, attributeId, fieldMeta, setFieldMeta } = props;

  // The config of the cell renderer that's being edited
  const [renderer, setRenderer] = useState<TCellRenderer>();
  const [selectedParameter, setSelectedParameter] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      // Fetch any pre-existing cell renderer on this table column
      setRenderer(deepCopy(
        fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer
      ));
    }

    // Reset state
    setSelectedParameter(undefined);
  }, [open]);

  // Used in the Header
  const TooltipHelp = (
    <ul>
      <li>
        {"When using text inputs, if you want to reference an attribute on the current Data Object, use the syntax ${attribute}"}
      </li>
      <li>
        {"Alternatively, if you would like to access attributes on the parent, prefix the attribute with a '~'. For example, ${~attribute}"}
      </li>
    </ul>
  );

  // The header is shared between both pages
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
      <span>
        Please be aware that the selected Cell Renderer works on a current Data Object. Find out more:
      </span>
      <span className="tol-data-point-renderer-info">
        <IconTooltip contents={TooltipHelp} />
      </span>
    </>
  );

  // The cell renderer types that can be picked in CellRendererSelector
  const typeChoices = useMemo(
    () => Object.keys(cellRendererParams)
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
      })),
    []
  );

  // The dropdown where the cell renderer type is chosen. This determines which parameters
  // need to be shown in ParameterList
  const CellRendererSelector = (
    <SingleSelect
      className="tol-data-point-renderer-modal-selector"
      block
      placeholder="Default Cell Renderer"
      value={
        renderer?.type || ""
      }
      onChange={(type: string) => setRenderer(
        type ? { ...renderer, type, props: {} } : undefined // TODO: props needed?
      )}
      data={typeChoices}
    />
  );

  // Each parameter associated with the selected cell renderer type
  const ParameterList = renderer && (
    <>
      {Object.keys(cellRendererParams[renderer?.type]?.params || {}).length > 0 && (
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
                selectedParam={selectedParameter}
                setSelectedParam={setSelectedParameter}
              />
            )
          })}
        </div>
      )}
    </>
  );

  // Shown only on the first page. Needs to be added as the action button instead of at the
  // bottom of the page so that it sits alongside the close button.
  // (In contrast to the second page, which has custom buttons at the bottom)
  const AddCellRendererButton = (
    <Button
      {...BUTTONS.ADD}
      // disabled={!rendererHasPendingChanges || requiredParamsCount > filledParamsCount}
      // onClick={onAddNewRenderer}
    />
  );

  // The first page of the modal where the cell renderer type is selected and its parameters
  // shown. Some parameters can be edited directly, while others take you to the second page
  // to edit them
  const FirstPage = (
    <>
      {CellRendererSelector}
      <hr />
      {ParameterList}
    </>
  );
  // The second page of the modal: a dedicated space to edit a specific parameter
  const SecondPage = <CellRendererParamOptions param={selectedParameter || ""} />;

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={Header}
      size={selectedParameter ? "sm" : "xs"}
      closeButton={!selectedParameter}
      actionButton={selectedParameter ? undefined : AddCellRendererButton}
    >
      {selectedParameter ? SecondPage : FirstPage}
    </Modal>
  )
}
