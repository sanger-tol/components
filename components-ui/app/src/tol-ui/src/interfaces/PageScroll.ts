/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IUseScrollSpyResult {
  /** The sub-section currently active based on the user's scroll position. */
  activeSubSection?: string;
  /** Smoothly scrolls the container to the sub-section containing `anchorId`. */
  scrollToAnchor: (anchorId: string) => void;
}

export interface IUseScrollSpyArgs {
  /** Ordered nav items, matching the order they are rendered in the DOM. */
  items: IScrollNavItem[];
  /** DOM id of the scrollable container that holds the anchors. */
  containerId: string;
  /** Value written to the section query param while active. */
  sectionKey?: string;
  /** Query param used to store the active section. Omit to skip it. */
  sectionParam?: string;
  /** Query param used to store the active sub-section. Omit to skip URL syncing. */
  subSectionParam?: string;
  /** Only the active scroll spy reads from or writes to the URL. Defaults to `true`. */
  active?: boolean;
}

export interface IScrollNavItem {
  /** DOM id of the element the nav item scrolls to. */
  anchorId: string;
  /** Sub-section the item belongs to. */
  subSection: string;
  /** Name of the field associated with the item. */
  field: string;
  /** Position of the field within the form config. */
  index: number;
}

export interface IScrollNavGroup {
  /** Sub-section identifier, as referenced by each field's `section` property. */
  subSection: string;
  /** Display label for the sub-section. */
  label: string;
  /** Ordered fields within the sub-section. */
  fields: {
    anchorId: string;
    label: string;
    name: string;
    index: number;
  }[];
}
