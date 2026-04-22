/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  JsonEditor as JsonEdit,
} from "json-edit-react";
import type { IJsonData, IJsonEditorOptions } from "..";
import { getJsonEditorTheme } from "./utils";

export interface PJsonEditor {
  /**
   * The JSON data to be displayed and edited in the editor.
   * This should be an object that conforms to the expected structure
   * defined by the JSON schema (if provided).
   */
  data: IJsonData;
  /**
   * Callback function to update the JSON data.
   */
  setData: (data: IJsonData) => void;
  /**
   * Callback function to update JSON data as it's being changed.
   * This method is preferred over setData, as it gives you more control.
   */
  onUpdate?: (data: any) => void;
  /**
   * Options for configuring the behavior and appearance of the JSON editor.
   */
  options?: IJsonEditorOptions;
}

/**
 * @autodoc
 * 
 * JsonEditor is a component that renders a JSON editor interface using the `json-edit-react` library.
 * It allows users to view and optionally edit JSON data, with support for various configuration options
 * such as clipboard functionality, collection counts, and array indices. 
 * The editor's theme adapts to the user's preferred color scheme.
 */
export function JsonEditor(props: PJsonEditor & IJsonEditorOptions) {
  const {
    viewOnly = true,
    enableClipboard = false,
    rootName = "data",
    showCollectionCount = "when-closed",
    showArrayIndices = false,
  } = props;

  const jsonEditTheme = getJsonEditorTheme();

  return (
    <div className="tol-json-editor-container">
      <JsonEdit
        {...props}
        rootName={rootName}
        theme={jsonEditTheme}
        viewOnly={viewOnly}
        enableClipboard={enableClipboard}
        showArrayIndices={showArrayIndices}
        arrayIndexFromOne={false}
        showCollectionCount={showCollectionCount}
      />
    </div>
  );
}
