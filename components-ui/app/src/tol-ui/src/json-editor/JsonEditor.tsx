/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  JsonEditor as JsonEdit,
  githubDarkTheme,
  githubLightTheme,
} from "json-edit-react";

export interface IJsonSchema {
  data: {
    title: string;
    description: string;
    version: string;
    properties: {
      [key: string]: unknown;
    };
  };
}

export interface IJsonData {
  [key: string]: unknown;
}

export type TJsonSchemaOrNull = IJsonSchema | null;

export interface IJsonEditorOptions {
  viewOnly?: boolean;
  enableClipboard?: boolean;
  rootName?: string;
  showCollectionCount?: boolean | "when-closed";
  showArrayIndices?: boolean;
  onEdit?: any;
  onEditEvent?: any;
}

export interface PJsonEditor {
  data: IJsonData;
  setData: (data: IJsonData) => void;
  onUpdate?: (data: any) => void;
  options: IJsonEditorOptions;
}

export function JsonEditor(props: PJsonEditor & IJsonEditorOptions) {
  const {
    viewOnly = true,
    enableClipboard = false,
    rootName = "data",
    showCollectionCount = "when-closed",
    showArrayIndices = false,
  } = props;

  const darkModeQuery =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  return (
    <div
      className="tol-json-editor-container"
      style={{
        border: "2px solid var(--tol-grey-light)",
        borderRadius: "4px",
        padding: "10px",
        width: "100%",
        height: "70vh",
        overflow: "auto",
      }}
    >
      <JsonEdit
        {...props}
        rootName={rootName}
        theme={
          darkModeQuery.matches
            ? [
                githubDarkTheme,
                { styles: { container: { backgroundColor: "var(--tol-bg)" } } },
              ]
            : [githubLightTheme]
        }
        viewOnly={viewOnly}
        enableClipboard={enableClipboard}
        showArrayIndices={showArrayIndices}
        arrayIndexFromOne={false}
        showCollectionCount={showCollectionCount}
      />
    </div>
  );
}
