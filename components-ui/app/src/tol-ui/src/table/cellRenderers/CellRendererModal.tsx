/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import {
  AttributeTitle,
  Button,
  BUTTONS,
  CellRendererConditionParamOptions,
  CellRendererMarkdownParamOptions,
  cellRendererParams,
  deepCopy,
  FieldMeta,
  IconTooltip,
  isEmptyObject,
  Modal,
  normaliseCaps,
  SingleSelect,
} from "../..";
import type { IRemoteTarget, TCellRenderer, TCellRendererParamType } from "../..";

import { CellRendererParam } from "./CellRendererParam";

export interface PCellRendererModal extends IRemoteTarget {
  /**
   * Controls whether the modal is open or closed
   */
  open: boolean,
  /**
   * The state setter for `open` so the modal can trigger a close
   */
  setOpen: Dispatch<SetStateAction<boolean>>,
  /**
   * The table column being configured
   */
  attributeId: string,
  /**
   * The metadata for the field being configured: where the cell renderer options are stored.
   * It is often written to be reference rather than the state setter.
   * */
  fieldMeta: FieldMeta,
  /**
   * State setter for `fieldMeta`. Typically, changes are applied by writing to `fieldMeta` directly,
   * then this is called to 'formally apply' the changes (`setFieldMeta({ ...fieldMeta })`)
   */
  setFieldMeta: (fieldMeta: FieldMeta) => void,
}

/**
 * The modal used to configure the cell renderer for a column in a table.
 * Opened by the palette icon (`CellRendererConfigurer`) in the column config drawer.
 */
export function CellRendererModal(props: PCellRendererModal) {
  const { open, setOpen, objectType, dataSource, attributeId, fieldMeta, setFieldMeta } = props;

  // The config of the cell renderer that's being edited
  const [renderer, setRenderer] = useState<TCellRenderer>();
  // Used to know whether changes have been made to the cell renderer (by checking it against `renderer`)
  const [previousRenderer, setPreviousRenderer] = useState<TCellRenderer>();
  // A parameter may need to be highlighted to be edited in more detail (via switching to the second page)
  const [selectedParameter, setSelectedParameter] = useState<string | undefined>();
  // Whether changes have been made in page 2
  const [doesSelectedParamHavePendingChanges, setDoesSelectedParamHavePendingChanges] = useState(false);

  // Used in the modal config and for disabling buttons.
  // Whether changes have been made in page 1
  const doesRendererHavePendingChanges = useMemo(
    () => JSON.stringify(renderer) !== JSON.stringify(previousRenderer),
    [renderer, previousRenderer]
  );

  useEffect(() => {
    if (open) {
      // Fetch any pre-existing cell renderer on this table column
      setRenderer(deepCopy(
        fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer
      ));
      setPreviousRenderer(deepCopy(
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

  // Called when the AddCellRendererButton is clicked.
  // The end goal of this modal; applies the changes made throughout
  const handleAddRenderer = () => {
    // Prepare fieldMeta to be set on the zone.
    // If there's a renderer (either made in this modal or carried over from what the attribute already had)
    // then we apply this new renderer onto fieldMeta.
    // If there's not a renderer (either we made no changes or the renderer on the attribute was removed)
    // then we clear the cell renderer off of fieldMeta.
    if (renderer) {
      // Make sure the data is a valid object
      fieldMeta.data![attributeId] = fieldMeta.data![attributeId] || {};
      fieldMeta.dataWithDefaults![attributeId] = fieldMeta.dataWithDefaults![attributeId] || {};
      
      // Set the new cell renderer we made in this modal to the attribute
      fieldMeta.data![attributeId].cellRenderer = renderer;
      fieldMeta.dataWithDefaults![attributeId].cellRenderer = renderer;
    } else {
      // Remove any existing cell renderer
      delete fieldMeta.data![attributeId].cellRenderer;
      // Remove other metadata
      if (isEmptyObject(fieldMeta.data![attributeId])) {
        delete fieldMeta.data![attributeId];
      }

      // Do the same for dataWithDefaults
      delete fieldMeta.dataWithDefaults![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.dataWithDefaults![attributeId])) {
        delete fieldMeta.dataWithDefaults![attributeId];
      }
    }

    // Formally apply the changes to fieldMeta so that they update on the Zone
    setFieldMeta({ ...fieldMeta! });

    // Close the modal
    setOpen(false);
  };

  // Shown only on the first page. Needs to be added as the action button instead of at the
  // bottom of the page so that it sits alongside the close button.
  // (In contrast to the second page, which has custom buttons at the bottom)
  const AddCellRendererButton = (
    <Button
      {...BUTTONS.ADD}
      disabled={!doesRendererHavePendingChanges} // || requiredParamsCount > filledParamsCount
      onClick={handleAddRenderer}
    />
  );

  // The first page of the modal where the cell renderer type is selected and its parameters
  // shown. Some parameters can be edited directly, while others take you to the second page
  // to edit them
  const FirstPage = (
    <>
      {CellRendererSelector}
      <p>
        {renderer && cellRendererParams[renderer.type]?.description}
      </p>
      <hr />
      {ParameterList}
    </>
  );

  // The second page of the modal: a dedicated space to edit a specific parameter
  const selectedParameterType: TCellRendererParamType | undefined = useMemo(() => {
    if (renderer && selectedParameter) {
      return cellRendererParams[renderer.type].params?.[selectedParameter].type;
    } else {
      return undefined;
    }
  }, [selectedParameter]);
  const SecondPage = selectedParameterType == "condition" ? (
    <CellRendererConditionParamOptions
      paramName={selectedParameter || ""}
      renderer={renderer}
      setRenderer={setRenderer}
      previousRenderer={previousRenderer}
      hasPendingChanges={doesSelectedParamHavePendingChanges}
      setHasPendingChanges={setDoesSelectedParamHavePendingChanges}
      goBack={() => setSelectedParameter(undefined)}
      objectType={objectType}
      dataSource={dataSource}
    />
  ) : selectedParameterType == "markdown" ? (
    <CellRendererMarkdownParamOptions
      paramName={selectedParameter || ""}
      renderer={renderer}
      setRenderer={setRenderer}
      hasPendingChanges={doesSelectedParamHavePendingChanges}
      setHasPendingChanges={setDoesSelectedParamHavePendingChanges}
      goBack={() => setSelectedParameter(undefined)}
      objectType={objectType}
      dataSource={dataSource}
    />
  ) : (
    <></>
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={Header}
      size={selectedParameter ? "sm" : "xs"}
      closeButton={!selectedParameter}
      actionButton={selectedParameter ? undefined : AddCellRendererButton}
      hasPendingChanges={doesRendererHavePendingChanges || doesSelectedParamHavePendingChanges}
    >
      {selectedParameter ? (
        <>
          <hr/>
          {SecondPage}
        </>
      ) : (
        FirstPage
      )}
    </Modal>
  )
}
