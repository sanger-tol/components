/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IFormValueSource,
  TFormField,
} from "../..";

/** A path into nested form data, using object keys and array indexes. */
export type TFormValuePath = readonly (string | number)[];

/** A form data path that starts with a top-level field name. */
export type TFormFieldPath = readonly [string, ...(string | number)[]];

/**
 * Renders a form field's control. Nested fields pass the path of their parent
 * record, and drawer fields pass the draft as their value source.
 */
export type TRenderFormField = (
  field: TFormField,
  parentPath?: TFormValuePath,
  parentReadOnly?: boolean,
  source?: IFormValueSource,
) => JSX.Element | null;
