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


export interface PCellRendererParam extends IRemoteTarget { // maybe
  param: string,
  values: IBoardParam,
  renderer: TCellRenderer
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  selectedLogicParam: string | undefined;
  setSelectedLogicParam: Dispatch<SetStateAction<string | undefined>>;
}

export function CellRendererParam(props: PCellRendererParam) {
  const {
    param,
    values,
    renderer,
    setRenderer,
    selectedLogicParam,
    setSelectedLogicParam
  } = props;

  return (
    <div key={param}>
      <span className="tol-param-title">
        {values.rename}:
      </span>
      {values.required &&
        <span className="tol-param-required">*</span>
      }
      <span className="tol-param-info">
        <IconTooltip contents={values.description} disableMarkdown />
      </span>
      <div className="tol-param">
        {values.type === "string" ? (
          <Input
            value={renderer?.props![param]}
            onChange={(newValue: string) => {
              if (renderer) {
                renderer.props![param] = newValue;
                setRenderer({ ...renderer });
              }
            }}
            placeholder={values.previewExample}
          />
        ) : values.type === "boolean" ? (
          <Button
            outline
            text="Configure Logic"
            onClick={() => {
              setSelectedLogicParam(
                param === selectedLogicParam ? undefined : param
              );
            }}
            active={param === selectedLogicParam}
          />
        ) : null}
      </div>
    </div>
  );
}
