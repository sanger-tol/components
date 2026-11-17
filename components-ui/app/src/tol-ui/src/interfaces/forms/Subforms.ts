/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import type {
  IFormComponent,
  IFormValueSource,
  TFormField,
  TFormFieldPath,
  TFormValuePath,
} from "../..";

/** Configures a nested object form, or a repeatable form for an array of objects. */
export interface ISubformField
  extends Omit<IFormComponent, "multiple" | "minOne"> {
  /** Identifies this field as a subform. */
  type: "subform";
  /** Fields that make up each nested object. */
  fields: TFormField[];
  /** When true, the field value is an array of objects; otherwise it is one object. */
  multiple?: boolean;
  /** Minimum number of objects required when multiple is true. */
  minItems?: number;
  /** Maximum number of objects allowed when multiple is true. */
  maxItems?: number;
  /** Singular label used for subform actions, such as "Add parent project". */
  itemLabel?: string;
  /** Relative field names used to display a summary for each object. */
  summaryFields?: string[];
  /**
   * Shows inline repeatable items as summary cards, expanding an item only
   * while it is being edited. Drawer subforms always use summary cards.
   */
  summary?: boolean;
  /** Controls whether the subform editor is shown inline or in a drawer. */
  editor?: {
    /** Explicit presentation, or choose automatically based on drawerThreshold. */
    presentation?: "inline" | "drawer" | "auto";
    /** In auto mode, use a drawer when the nested form exceeds this field count. */
    drawerThreshold?: number;
  };
}

/** State required to edit one repeatable subform item in a drawer. */
export interface ISubformDrawerState {
  /** Configuration for the subform being edited. */
  field: ISubformField;
  /** Path to the subform value in form data. */
  path: TFormFieldPath;
  /** Index of the item when editing a repeatable subform. */
  itemIndex?: number;
  /** Whether this item is being added rather than edited. */
  isNew: boolean;
  /** The item as it was when the drawer opened, used to detect unsaved changes. */
  initialValue?: unknown;
}

/** Subform actions shared by every subform rendered in a form. */
export interface ISubformControls {
  /** Opens a subform item, or a single subform object, in the drawer. */
  openDrawer: (
    field: ISubformField,
    path: TFormFieldPath,
    itemIndex?: number,
  ) => void;
  /** Whether an inline summary item is open for editing. */
  isItemExpanded: (path: TFormValuePath) => boolean;
  /** Opens or closes an inline summary item for editing. */
  setItemExpanded: (path: TFormValuePath, expanded: boolean) => void;
  /** Forgets a removed item's open state and shifts later items down. */
  removeItem: (path: TFormFieldPath, removedIndex: number) => void;
}

/** Drawer state and actions returned by `useSubformDrawer`. */
export interface ISubformDrawer {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Controls the drawer's open state. */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** The subform being edited, or `null` when nothing is open. */
  state: ISubformDrawerState | null;
  /** Value source for the draft, or `undefined` when nothing is open. */
  source?: IFormValueSource;
  /** Path to the item being edited in the draft. */
  itemPath?: TFormFieldPath;
  /** Whether the draft differs from the item it was opened with. */
  hasPendingChanges: boolean;
  /** Opens a subform item, or a single subform object, in the drawer. */
  openDrawer: ISubformControls["openDrawer"];
  /** Commits the draft to the form. */
  save: () => void;
  /** Drops the draft. */
  discard: () => void;
}
