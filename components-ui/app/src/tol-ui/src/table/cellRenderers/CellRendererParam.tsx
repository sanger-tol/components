/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";
import { Input } from "rsuite";
import {
  Button,
  TCellRenderer,
  IconTooltip,
  IBoardCellRendererParam,
  IRemoteTarget,
  IFilter
} from "../..";


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

  const paramValue = renderer?.props![param];
  const conditionPresent = Object.keys((paramValue as IFilter || {}).and_ || {}).length > 0;

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
                renderer.props![param] = newValue;
                setRenderer({ ...renderer });
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
        ) : null}
      </div>
    </div>
  );
}
