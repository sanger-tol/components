/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, PButton } from "..";


export function SaveButton(props: PButton) {
  return (
    <Button
      type="success"
      icon="save"
      tooltip="Save"
      disabledTooltip="No changes to save"
      {...props}
    />
  );
}
