/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, PButton } from "..";


export function DiscardButton(props: PButton) {
  return (
    <Button
      type="error"
      icon="trash"
      tooltip="Discard Changes"
      disabledTooltip="No changes to discard"
      {...props}
    />
  );
}
