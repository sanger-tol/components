/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon, Placeholder, useBoard } from "..";


export function NotConfiguredPlaceholder() {
  const { editMode } = useBoard();

  const message = editMode ? (
    <>
      Please click <Icon icon="sliders" size="sm" /> to get started.
    </>
  ) : (
    <>
      This component is still being set up.
    </>
  );

  return (
    <Placeholder
      message={message}
    />
  );
}
