/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface PCellRendererParamOptions {
  param: string;
}

export function CellRendererParamOptions(props: PCellRendererParamOptions) {
  const { param } = props;

  return (
    <p>Options for {param}</p>
  )
}
