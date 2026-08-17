/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction, useState } from "react";

import { Button, BUTTONS, cellRendererParams, deepCopy, FormMarkdown } from "../..";
import type { IRemoteTarget, TCellRenderer } from "../..";

export interface PCellRendererMarkdownParamOptions extends IRemoteTarget {
  /**
   * The name of the markdown cell renderer parameter being edited
   */
  paramName: string;
  /**
   * A reference to the cell renderer being configured
   */
  renderer: TCellRenderer;
  /**
   * The state setter for `renderer`.
   * Like `fieldMeta` in `CellRendererModal`, this is written to by reference,
   * then 'formally updated' with `setRenderer({ ...renderer })`. 
   */
  setRenderer: Dispatch<SetStateAction<TCellRenderer>>;
  /**
   * The state of the same name from the parent `CellRendererModal` component. Needed to disable
   * the confirmation button
   */
  hasPendingChanges: boolean;
  /**
   * State setter for `hasPendingChanges`. Updated using `previousRenderer` and `renderer`
   */
  setHasPendingChanges: Dispatch<SetStateAction<boolean>>;
  /**
   * Switches the active page in `CellRendererModal` back to the first one (this is the second)
   */
  goBack: () => void;
}

/**
 * The second page of `CellRendererModal` when a markdown parameter is being edited
 */
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
    <div className="tol-data-point-renderer-modal-bottom-buttons">
      <Button
        {...BUTTONS.ADD}
        disabled={!hasPendingChanges}
        onClick={handleSave}
      />
      <Button
        {...BUTTONS.RETURN}
        onClick={handleBack}
      />
    </div>
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
