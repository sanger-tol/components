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
  IBoardParam,
  IRemoteTarget
} from "../..";


export interface PCellRendererParam extends IRemoteTarget {
  param: string,
  meta: IBoardParam,
  renderer: TCellRenderer
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  selectedConditionParam: string | undefined;
  setSelectedConditionParam: Dispatch<SetStateAction<string | undefined>>;
}

export function CellRendererParam(props: PCellRendererParam) {
  const {
    param,
    meta,
    renderer,
    setRenderer,
    selectedConditionParam,
    setSelectedConditionParam
  } = props;

  return (
    <div key={param}>
      <span className="tol-param-title">
        {meta.rename}:
      </span>
      {meta.required &&
        <span className="tol-param-required">*</span>
      }
      <span className="tol-param-info">
        <IconTooltip contents={meta.description} disableMarkdown />
      </span>
      <div className="tol-param">
        {meta.type === "string" ? (
          <Input
            value={renderer?.props![param] as string}
            onChange={(newValue: string) => {
              if (renderer) {
                renderer.props![param] = newValue;
                setRenderer({ ...renderer });
              }
            }}
            placeholder={meta.placeholder}
          />
        ) : meta.type === "boolean" ? (
          <Button
            text="Configure Condition"
            icon="gears"
            onClick={() => {
              setSelectedConditionParam(
                param === selectedConditionParam ? undefined : param
              );
            }}
            active={param === selectedConditionParam}
          />
        ) : null}
      </div>
    </div>
  );
}
