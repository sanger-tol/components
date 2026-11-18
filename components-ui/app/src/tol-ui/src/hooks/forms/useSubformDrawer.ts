/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  createInitialDataSnapshot,
  deepestEqual,
  getValueAtPath,
  isRecord,
  setValueAtPath,
} from "../..";
import type {
  IFormValueSource,
  ISubformDrawer,
  ISubformDrawerState,
  TFormFieldPath,
} from "../..";

/**
 * Manages the drawer used to add or edit subform items. Edits happen on a
 * detached copy of the form data, so they only reach the form when saved.
 *
 * @param formData - The live form data.
 * @param onCommit - Writes a saved value into the live form data.
 * @returns The drawer's state, draft value source and actions.
 */
export function useSubformDrawer(
  formData: Record<string, unknown>,
  onCommit: (path: TFormFieldPath, value: unknown) => void,
): ISubformDrawer {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ISubformDrawerState | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);

  const openDrawer: ISubformDrawer["openDrawer"] = (field, path, itemIndex) => {
    const currentValue = getValueAtPath(formData, path);

    if (field.multiple) {
      const items = Array.isArray(currentValue) ? currentValue : [];
      const isNew = itemIndex === undefined;
      const item = isNew
        ? createInitialDataSnapshot({ fields: field.fields })
        : items[itemIndex];

      setDraft(setValueAtPath(formData, path, isNew ? [...items, item] : items));
      setState({
        field,
        path,
        itemIndex: itemIndex ?? items.length,
        isNew,
        initialValue: item,
      });
    } else {
      const isNew = !isRecord(currentValue);
      const item = isNew
        ? createInitialDataSnapshot({ fields: field.fields })
        : currentValue;

      setDraft(setValueAtPath(formData, path, item));
      setState({ field, path, isNew, initialValue: item });
    }

    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setState(null);
    setDraft(null);
  };

  const itemPath: TFormFieldPath | undefined = state
    ? state.itemIndex === undefined
      ? state.path
      : [...state.path, state.itemIndex]
    : undefined;

  const draftItem =
    draft && itemPath ? getValueAtPath(draft, itemPath) : undefined;

  // Compared against the item the drawer opened with, so an untouched new item has nothing to save
  const hasPendingChanges = Boolean(
    state && !deepestEqual(draftItem, state.initialValue ?? null),
  );

  const save = () => {
    if (!state || !itemPath) return;

    if (state.field.multiple && state.isNew) {
      const currentItems = getValueAtPath(formData, state.path);
      onCommit(state.path, [
        ...(Array.isArray(currentItems) ? currentItems : []),
        draftItem,
      ]);
    } else {
      onCommit(itemPath, draftItem);
    }

    close();
  };

  const source: IFormValueSource | undefined = draft
    ? {
        data: draft,
        onChange: (path, value) =>
          setDraft((previousDraft) =>
            previousDraft
              ? setValueAtPath(previousDraft, path, value)
              : previousDraft,
          ),
      }
    : undefined;

  return {
    open,
    setOpen,
    state,
    source,
    itemPath,
    hasPendingChanges,
    openDrawer,
    save,
    discard: close,
  };
}
