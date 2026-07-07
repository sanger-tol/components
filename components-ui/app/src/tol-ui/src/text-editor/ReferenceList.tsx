/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import type {
  ReferenceNodeAttrs,
  TextEditorReference,
} from "./ReferenceExtension";
import { Button, Icon } from "..";

export interface PReferenceList {
  items: TextEditorReference[];
  command: (attrs: ReferenceNodeAttrs) => void;
  onCreateNew: () => void;
  onEdit?: (reference: TextEditorReference) => void;
}

export interface ReferenceListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const ReferenceList = forwardRef<ReferenceListRef, PReferenceList>(
  function ReferenceList({ items, command, onCreateNew, onEdit }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (index === items.length) {
        onCreateNew();
      }

      if (item) {
        command({ id: item.id, label: item.title, url: item.url });
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        const count = items.length + 1;

        if (count === 0) {
          return false;
        }

        if (event.key === "Escape") {
          setSelectedIndex(0);
          return true;
        }

        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + count - 1) % count);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % count);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    return (
      <div className="tol-text-editor__reference-menu">
        {items.length ? (
          items.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`tol-text-editor__reference-menu-item${
                index === selectedIndex
                  ? " tol-text-editor__reference-menu-item--selected"
                  : ""
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => selectItem(index)}
            >
              {item.title}
            </button>
          ))
        ) : (
          <div className="tol-text-editor__reference-menu-empty">
            No references found
          </div>
        )}
        <button
          type="button"
          className={`tol-text-editor__reference-menu-item${
            selectedIndex === items.length
              ? " tol-text-editor__reference-menu-item--selected"
              : ""
          }`}
          onMouseEnter={() => setSelectedIndex(items.length)}
          onClick={() => {
            selectItem(items.length);
            onCreateNew();
          }}
        >
          <Icon icon="plus" /> New Reference
        </button>
      </div>
    );
  },
);
