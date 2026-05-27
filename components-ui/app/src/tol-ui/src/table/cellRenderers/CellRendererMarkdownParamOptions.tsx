/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useState } from "react";

import { Button, BUTTONS, cellRendererParams, deepCopy, FormMarkdown, IRemoteTarget, TCellRenderer } from "../..";

export interface PCellRendererMarkdownParamOptions extends IRemoteTarget {
  paramName: string;
  renderer: TCellRenderer;
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  hasPendingChanges: boolean;
  setHasPendingChanges: Dispatch<SetStateAction<boolean>>;
  goBack: () => void;
}

export function CellRendererMarkdownParamOptions(props: PCellRendererMarkdownParamOptions) {
  const {
    paramName,
    renderer,
    setRenderer,
    hasPendingChanges,
    setHasPendingChanges,
    goBack
  } = props;

  const [rendererBeforeChanges, _setRendererBeforeChanges] = useState(deepCopy(renderer));
  const [markdownText, setMarkdownText] = useState(renderer!.props![paramName!] as string);

  const handleSave = () => {
    renderer!.props![paramName!] = markdownText;
    setRenderer({ ...renderer! });
    setHasPendingChanges(false);
    goBack();
  };

  const handleBack = () => {
    setRenderer(rendererBeforeChanges);
    setHasPendingChanges(false);
    goBack();
  };

  const BottomButtons = (
    <>
      <Button
        {...BUTTONS.ADD}
        disabled={!hasPendingChanges}
        onClick={handleSave}
      />
      <Button
        {...BUTTONS.RETURN}
        onClick={handleBack}
      />
    </>
  );

  return (
    <div>
      <h6>
        Configure Condition for
        '{cellRendererParams[renderer?.type!].params?.[paramName]?.rename}'
        Parameter
      </h6>
      <FormMarkdown
        value={markdownText}
        onChange={(newValue) => {
          setMarkdownText(newValue);
          setHasPendingChanges(Boolean(newValue));
        }}
      />
      {BottomButtons}
    </div>
  )
}
