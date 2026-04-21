/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  JsonEditor as JsonEdit,
} from "json-edit-react";
import type { IJsonData } from "..";
import { getJsonEditorTheme } from "./utils";

export interface IJsonEditorOptions {
  /**
   * Whether the editor should be in view-only mode (default: true).
   * In view-only mode, users cannot edit the JSON data.
   * Set to false to allow editing.
   */
  viewOnly?: boolean;
  /**
   * Whether to enable clipboard functionality (default: false).
   */
  enableClipboard?: boolean;
  /**
   * The name of the root element in the JSON editor (default: "data").
   */
  rootName?: string;
  /**
   * Whether to show the count of items in collections (default: "when-closed").
   */
  showCollectionCount?: boolean | "when-closed";
  /**
   * Whether to show indices for array elements (default: false).
   */
  showArrayIndices?: boolean;
  /**
   * Callback function triggered when the JSON data is edited.
   */
  onEdit?: any;
  /**
   * Callback function triggered on specific edit events.
   */
  onEditEvent?: any;
}

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
