/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IFormScrollNavConfig {
  /** Defaults to `true` when a config object is supplied. */
  enabled?: boolean;
  /** Identifies the form in anchor/container ids and the section query param. Defaults to `"form"`. */
  key?: string;
  /** Heading shown above the scrollable form. */
  title?: string;
  /** Whether the side navigation starts expanded. Defaults to `false`. */
  defaultOpen?: boolean;
  /**
   * Show field statuses and section summaries in the side navigation. Defaults to `true`.
   * Also shows progress for required editable fields. A provided value is not
   * necessarily valid until validation has run. A section with required fields
   * is complete when those fields are provided and there are no known errors;
   * unfilled recommended fields are reported separately.
   */
  showStatus?: boolean;
  /**
   * Whether this form currently owns the URL query params, e.g. when it is
   * the visible tab. Defaults to `true`.
   */
  active?: boolean;
  /** Whether to mirror the section/sub-section in the URL. Defaults to `true`. */
  syncUrl?: boolean;
  /** Query param used to store the active form section in the URL. Defaults to `"s"`. */
  sectionParam?: string;
  /** Query param used to store the active sub-section in the URL. Defaults to `"sub"`. */
  subSectionParam?: string;
}

/** Context for determining the status of a form field. */
export interface IFieldStatusContext {
  /** Whether the entire form is locked. */
  formLocked: boolean;
  /** Whether the current section is locked. */
  sectionLocked?: boolean;
  /** Error message associated with the field, if any. */
  error?: string;
}
