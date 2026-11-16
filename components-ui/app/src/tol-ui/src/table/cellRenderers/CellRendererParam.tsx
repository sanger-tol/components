/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";
import { Input, Toggle } from "rsuite";

import {
  Button,
  IconTooltip,
} from "../..";
import type { IBoardCellRendererParam, IFilter, IRemoteTarget, TCellRenderer } from "../..";

export interface PCellRendererParam extends IRemoteTarget {
  param: string,
  meta: IBoardCellRendererParam,
  renderer: TCellRenderer
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  selectedParam: string | undefined;
  setSelectedParam: Dispatch<SetStateAction<string | undefined>>;
}

export function CellRendererParam(props: PCellRendererParam) {
  const {
    param,
    meta,
    renderer,
    setRenderer,
    selectedParam,
    setSelectedParam
  } = props;

  const paramValue = renderer?.props?.[param];
  const conditionPresent = Object.keys((paramValue as IFilter || {}).and_ || {}).length > 0;

  const updateRendererParam = (value: string | boolean) => {
    if (!renderer) return;
    setRenderer({
      ...renderer,
      props: { ...renderer.props, [param]: value },
    });
  };

  return (
    <div key={param}>
      <span className="tol-param-title">
        {meta.rename}:
      </span>
      {meta.required &&
        <span className="tol-param-required">*</span>
      }
      <span className="tol-data-point-renderer-info">
        <IconTooltip contents={meta.description} disableMarkdown />
      </span>
      <div className="tol-param">
        {meta.type === "string" ? (
          <Input
            value={paramValue as string}
            onChange={(newValue: string) => {
              if (renderer) {
                updateRendererParam(newValue);
              }
            }}
            placeholder={meta.placeholder}
          />
        ) : meta.type === "condition" ? (
          <Button
            outline
            text={conditionPresent ? "Edit Condition" : "Set Condition"}
            icon="puzzle-piece"
            type={conditionPresent ? "warning" : "success"}
            onClick={() => {
              setSelectedParam(
                param === selectedParam ? undefined : param
              );
            }}
          />
        ) : meta.type === "boolean" ? (
          <Toggle
            checked={typeof paramValue === "boolean" ? paramValue : Boolean(meta.defaultValue)}
            onChange={(checked) => updateRendererParam(checked)}
            aria-label={meta.rename}
          />
        ) : meta.type === "markdown" ? (
          <Button
            outline
            text={paramValue ? "Edit Markdown" : "Add Markdown"}
            icon="puzzle-piece"
            type={paramValue ? "warning" : "success"}
            onClick={() => {
              setSelectedParam(
                param === selectedParam ? undefined : param
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
