/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon, Placeholder, useBoard } from "..";


export function NoAttributesPlaceholder() {
  const { editMode } = useBoard();

  const message = editMode ? (
    <>
      Please add an attribute to get started. Click <Icon icon="sliders" size="sm" /> to configure.
    </>
  ) : (
    <>
      No attributes currently selected.
    </>
  );

  return (
    <Placeholder
      message={message}
    />
  );
}
