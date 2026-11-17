/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormDrawer } from "../..";
import type { ISubformDrawer, TRenderFormField } from "../..";

/** Props for the drawer that edits subform drafts. */
export interface PSubformDrawer {
  /** Drawer state from `useSubformDrawer`. */
  drawer: ISubformDrawer;
  /** Whether the subform's fields are read-only. */
  readOnly: boolean;
  /** Renders the subform's fields. */
  renderField: TRenderFormField;
}

// Renders the open subform draft's fields in a drawer with save and discard controls.
export function SubformDrawer(props: PSubformDrawer) {
  const { drawer, readOnly, renderField } = props;
  const { itemPath, source, state } = drawer;

  if (!state || !source || !itemPath) return null;

  const itemLabel = state.field.itemLabel ?? state.field.label ?? "Item";

  return (
    <FormDrawer
      open={drawer.open}
      setOpen={drawer.setOpen}
      title={`${state.isNew ? "Add" : "Edit"} ${itemLabel}`}
      hasPendingChanges={drawer.hasPendingChanges}
      onSave={drawer.save}
      onDiscard={drawer.discard}
    >
      <div className="tol-form-subform-fields">
        {state.field.fields.map((nestedField) => (
          <div key={nestedField.name}>
            {renderField(nestedField, itemPath, readOnly, source)}
          </div>
        ))}
      </div>
    </FormDrawer>
  );
}
