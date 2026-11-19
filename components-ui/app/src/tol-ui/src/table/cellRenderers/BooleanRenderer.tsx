/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BooleanStatus, PCellDisplay } from "../..";

/** Renders a boolean value as a status message using the BooleanStatus component. */
export function BooleanRenderer(props: PCellDisplay) {
  if (typeof props.value !== "boolean") return null;

  return <BooleanStatus value={props.value} />;
}
