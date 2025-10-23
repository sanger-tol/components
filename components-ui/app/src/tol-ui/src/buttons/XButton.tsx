/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, PButton } from "..";


export function XButton(props: PButton) {
  return (
    <Button
      outline
      type="error"
      icon="xmark"
      tooltip="Close"
      {...props}
    />
  );
}
