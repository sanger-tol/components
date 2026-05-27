/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useState } from "react";

import { Button, BUTTONS, FormMarkdown, IRemoteTarget, TCellRenderer } from "../..";

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

  const [markdownText, setMarkdownText] = useState("");

  const BottomButtons = (
    <>
      <Button
        {...BUTTONS.ADD}
      />
      <Button
        {...BUTTONS.RETURN}
        onClick={goBack}
      />
    </>
  );

  return (
    <div>
      <FormMarkdown
        value={markdownText}
        onChange={(newValue) => setMarkdownText(newValue)}
      />
      {BottomButtons}
    </div>
  )
}
