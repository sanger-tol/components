/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/** Error message shown when required fields are missing. */
export const MISSING_DATA_ERROR = "Please complete all required fields before submitting.";

/** Error message shown when an unsupported field type is encountered. */
export const UNSUPPORTED_FIELD_TYPE = "Unsupported field type:";

/** Help text shown for automatically generated fields. */
export const AUTOMATIC_FIELD_HELP_TEXT =
  "Generated automatically. Nothing to fill in.";

/** Placeholder text for read-only fields. */
export const READ_ONLY_FIELD_PLACEHOLDER = "";

/** Pre-defined form types. */
export const PRE_DEFINED_FORM_TYPES = {
    USER_PROFILE: "userProfile",
} as const;

/** The default number of subform fields at which the drawer presentation is used. */
export const DEFAULT_DRAWER_THRESHOLD_LIMIT = 5;
