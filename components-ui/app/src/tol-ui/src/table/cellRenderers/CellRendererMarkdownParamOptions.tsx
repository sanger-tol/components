/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";

import { IRemoteTarget, TCellRenderer } from "../..";

export interface PCellRendererMarkdownParamOptions extends IRemoteTarget {
  paramName: string;
  renderer: TCellRenderer;
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  previousRenderer: TCellRenderer;
  hasPendingChanges: boolean;
  setHasPendingChanges: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
}

export function CellRendererMarkdownParamOptions(props: PCellRendererMarkdownParamOptions) {
  const {
    paramName,
    renderer,
    setRenderer,
    previousRenderer,
    hasPendingChanges,
    setHasPendingChanges,
    goBack
  } = props;

  return (
    <div>
      <p>Editing {paramName}</p>
      <button onClick={goBack}>back</button>
    </div>
  )
}
