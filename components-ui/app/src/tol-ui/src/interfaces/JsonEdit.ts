/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

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
