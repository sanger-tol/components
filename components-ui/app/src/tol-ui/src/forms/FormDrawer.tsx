/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer, RSForm } from "..";
import type { PFormDrawer } from "..";

// Wraps subform draft editing in the shared drawer and its save/discard controls.
export function FormDrawer(props: PFormDrawer) {
  const {
    children,
    hasPendingChanges,
    onDiscard,
    onSave,
    open,
    setOpen,
    title,
  } = props;

  return (
    <Drawer
      open={open}
      setOpen={setOpen}
      title={title}
      hasPendingChanges={hasPendingChanges}
      onSave={onSave}
      onDiscard={onDiscard}
    >
      {/* The drawer is rendered outside the parent form, so its controls need their own form context. */}
      <RSForm fluid className="form-wrapper">
        {children}
      </RSForm>
    </Drawer>
  );
}
