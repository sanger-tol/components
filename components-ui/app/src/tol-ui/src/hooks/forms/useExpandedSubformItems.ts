/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import type { ISubformControls } from "../..";

/**
 * Tracks which inline summary items are open for editing, keyed by their
 * dotted data path.
 *
 * @returns Actions to read, toggle and forget an item's open state.
 */
export function useExpandedSubformItems(): Pick<
  ISubformControls,
  "isItemExpanded" | "setItemExpanded" | "removeItem"
> {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const isItemExpanded: ISubformControls["isItemExpanded"] = (path) =>
    Boolean(expandedItems[path.join(".")]);

  const setItemExpanded: ISubformControls["setItemExpanded"] = (
    path,
    expanded,
  ) => {
    setExpandedItems((current) => ({
      ...current,
      [path.join(".")]: expanded,
    }));
  };

  // Drops the removed item's state, and that of anything nested in it, then shifts later items down
  const removeItem: ISubformControls["removeItem"] = (path, removedIndex) => {
    const listKey = `${path.join(".")}.`;

    setExpandedItems((current) =>
      Object.entries(current).reduce<Record<string, boolean>>(
        (next, [key, expanded]) => {
          if (!key.startsWith(listKey)) {
            next[key] = expanded;
            return next;
          }

          const [indexPart, ...rest] = key.slice(listKey.length).split(".");
          const index = Number(indexPart);

          if (index === removedIndex) return next;

          const shiftedIndex = index > removedIndex ? index - 1 : index;
          next[[`${listKey}${shiftedIndex}`, ...rest].join(".")] = expanded;
          return next;
        },
        {},
      ),
    );
  };

  return { isItemExpanded, setItemExpanded, removeItem };
}
