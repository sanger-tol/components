/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IUseScrollSpyResult {
  /**
   * The sub-section of the editor that is currently active based on the user's
   * scroll position.
   */
  activeSubSection?: string;
  /**
   * Function to scroll the editor to a specific anchor ID.
   */
  scrollToAnchor: (anchorId: string) => void;
}

export interface IUseScrollSpyArgs {
  /** The key of the currently active section in the editor. */
  activeKey: string;
}

export interface IScrollNavItem {
  /**
   * The unique identifier for the navigation item, typically used as an anchor in the DOM.
   */
  anchorId: string;
  /**
   * The display name of the navigation item, shown in the UI.
   */
  subSection: string;
  /**
   * The field associated with the navigation item, used for linking to specific sections of the content.
   */
  field: string;
  /**
   * The index of the navigation item, indicating its position in the list of items.
   */
  index: number;
}

export interface IScrollNavGroup {
  /**
   * The unique identifier for the navigation group, typically used as an anchor in the DOM.
   */
  subSection: string;
  /**
   * The list of fields associated with the navigation group, each containing a field name and its index.
   * This allows for grouping related fields together under a common sub-section in the navigation.
   * Each field object contains:
   * - `field`: The name of the field.
   * - `index`: The position of the field within the group.
   */
  fields: { field: { name: string; label: string }; index: number }[];
}