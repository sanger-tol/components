/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import { Drawer, RSForm } from "../..";

/** Props for the drawer used to add or edit a subform item. */
export interface PFormDrawer {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Controls the drawer's open state. */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Drawer heading. */
  title: string;
  /** Whether the draft differs from its original value. */
  hasPendingChanges: boolean;
  /** Saves the current draft. */
  onSave: () => void;
  /** Discards the current draft. */
  onDiscard: () => void;
  /** Form fields rendered inside the drawer. */
  children: React.ReactNode;
}

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
