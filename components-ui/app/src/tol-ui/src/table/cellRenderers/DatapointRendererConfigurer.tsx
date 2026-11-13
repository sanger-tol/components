/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Button,
  BUTTONS,
  CellRendererConditionParamOptions,
  CellRendererMarkdownParamOptions,
  cellRendererParams,
  deepCopy,
  IconTooltip,
  isEmptyObject,
  normaliseCaps,
  SingleSelect,
} from "../..";
import type { IFieldMeta, IRemoteTarget, TCellRenderer, TCellRendererParamType } from "../..";
import { CellRendererParam } from "./CellRendererParam";

/** Props for the datapoint renderer configuration screen. */
export interface PDatapointRendererConfigurer extends IRemoteTarget {
  /** Attribute whose datapoint renderer is being configured. */
  attributeId: string;
  /** Current field metadata, including renderer settings in `dataWithDefaults`. */
  fieldMeta: IFieldMeta;
  /** Updates the caller's draft metadata when the user applies renderer changes. */
  setFieldMeta: Dispatch<SetStateAction<IFieldMeta>>;
}

/**
 * Renders the datapoint renderer configuration screen for one attribute.
 *
 * Renderer edits are staged locally until the user applies them. Applying updates
 * both `fieldMeta.data` and `fieldMeta.dataWithDefaults` through `setFieldMeta`;
 * persistence (such as saving to the database) remains the responsibility of the
 * parent component.
 */
export function DatapointRendererConfigurer(props: PDatapointRendererConfigurer) {
  const {
    objectType,
    dataSource,
    attributeId,
    fieldMeta,
    setFieldMeta,
  } = props;
  const [renderer, setRenderer] = useState<TCellRenderer>();
  const [previousRenderer, setPreviousRenderer] = useState<TCellRenderer>();
  const [selectedParameter, setSelectedParameter] = useState<string>();
  const [doesSelectedParamHavePendingChanges, setDoesSelectedParamHavePendingChanges] = useState(false);

  const doesRendererHavePendingChanges = useMemo(
    () => JSON.stringify(renderer) !== JSON.stringify(previousRenderer),
    [renderer, previousRenderer],
  );

  useEffect(() => {
    const existingRenderer = fieldMeta.dataWithDefaults?.[attributeId]?.cellRenderer;
    setRenderer(deepCopy(existingRenderer));
    setPreviousRenderer(deepCopy(existingRenderer));
    setSelectedParameter(undefined);
  }, [attributeId]);

  const typeChoices = useMemo(
    () => Object.keys(cellRendererParams)
      .filter((type) => {
        const allowed = cellRendererParams[type]?.allowedDataTypes;
        const attributeType = fieldMeta.dataWithDefaults?.[attributeId]?.type;
        return !allowed || allowed.includes(attributeType!);
      })
      .map((type) => ({
        label: cellRendererParams[type]?.rename || normaliseCaps(type),
        value: type,
      })),
    [fieldMeta, attributeId],
  );

  const CellRendererSelector = (
    <SingleSelect
      block
      placeholder="Default Cell Renderer"
      value={renderer?.type || ""}
      onChange={(type: string) => setRenderer(type ? { ...renderer, type, props: {} } : undefined)}
      data={typeChoices}
    />
  );

  const TooltipHelp = (
    <ul>
      <li>{"When using text inputs, if you want to reference an attribute on the current Data Object, use the syntax ${attribute}"}</li>
      <li>{"Alternatively, if you would like to access attributes on the parent, prefix the attribute with a '~'. For example, ${~attribute}"}</li>
    </ul>
  );

  const RendererHelp = (
    <p className="tol-mt-md">
      Please be aware that the selected Cell Renderer works on a current Data Object. Find out more:
      <span className="tol-data-point-renderer-info">
        <IconTooltip contents={TooltipHelp} />
      </span>
    </p>
  );

  const ParameterList = renderer && Object.keys(cellRendererParams[renderer.type]?.params || {}).length > 0 && (
    <div className="tol-data-point-renderer-modal-params">
      {Object.entries(cellRendererParams[renderer.type].params || {}).map(([param, meta]) => (
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
      ))}
    </div>
  );

  const handleApplyRenderer = () => {
    if (renderer) {
      fieldMeta.data![attributeId] = fieldMeta.data![attributeId] || {};
      fieldMeta.dataWithDefaults![attributeId] = fieldMeta.dataWithDefaults![attributeId] || {};
      fieldMeta.data![attributeId].cellRenderer = renderer;
      fieldMeta.dataWithDefaults![attributeId].cellRenderer = renderer;
    } else {
      delete fieldMeta.data![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.data![attributeId])) delete fieldMeta.data![attributeId];
      delete fieldMeta.dataWithDefaults![attributeId].cellRenderer;
      if (isEmptyObject(fieldMeta.dataWithDefaults![attributeId])) delete fieldMeta.dataWithDefaults![attributeId];
    }

    setFieldMeta({ ...fieldMeta });
    setPreviousRenderer(deepCopy(renderer));
  };

  const AddCellRendererButton = (
    <Button
      {...BUTTONS.ADD}
      text="Apply renderer"
      disabled={!doesRendererHavePendingChanges}
      onClick={handleApplyRenderer}
    />
  );

  const FirstPage = (
    <>
      {CellRendererSelector}
      {RendererHelp}
      <p className="tol-mt-sm">{renderer && cellRendererParams[renderer.type]?.description}</p>
      {ParameterList}
      {AddCellRendererButton}
    </>
  );

  const selectedParameterType: TCellRendererParamType | undefined = useMemo(
    () => renderer && selectedParameter
      ? cellRendererParams[renderer.type].params?.[selectedParameter].type
      : undefined,
    [renderer, selectedParameter],
  );

  const SecondPage = selectedParameterType === "condition" ? (
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
  ) : selectedParameterType === "markdown" ? (
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
  ) : null;

  return selectedParameter ? SecondPage : FirstPage;
}
