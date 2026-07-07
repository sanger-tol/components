/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { mergeAttributes } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import type { SuggestionOptions } from "@tiptap/suggestion";
import {
  ReferenceList,
  ReferenceListRef,
  PReferenceList,
} from "./ReferenceList";

/** Owns the `~` suggestion state so the toolbar button can read/toggle it */
export const referencePluginKey = new PluginKey("reference");

export interface TextEditorReference {
  id: string;
  title: string;
  url?: string;
}

export interface ReferenceNodeAttrs {
  id: string;
  label: string;
  url?: string | null;
}

export interface ReferenceExtensionOptions {
  onCreateReference: () => void;
  onEditReference: (reference: TextEditorReference) => void;
}

export const referenceToken = (id: string) => `[~ref:${id}]`;

/**
 * Toolbar action for the "Insert reference" button. Behaves as a toggle so
 * repeated clicks don't stack `~` characters:
 * - picker already open  → close it (don't insert another `~`)
 * - a `~` sits before the cursor → reopen the picker on it
 * - otherwise → insert a `~`, which opens the picker (default behaviour)
 */
export const toggleReferencePicker = (editor: Editor) => {
  const suggestionState = referencePluginKey.getState(editor.state);
  if (suggestionState?.active) {
    editor.view.dispatch(
      editor.state.tr.setMeta(referencePluginKey, { exit: true }),
    );
    return;
  }

  const { from } = editor.state.selection;
  const charBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from);
  if (charBefore === "~") {
    editor
      .chain()
      .focus()
      .deleteRange({ from: from - 1, to: from })
      .run();
    editor.chain().focus().insertContent("~").run();
    return;
  }

  editor.chain().focus().insertContent("~").run();
};

const referenceSuggestion = (
  references: TextEditorReference[],
  options: ReferenceExtensionOptions,
): Omit<
  SuggestionOptions<TextEditorReference, ReferenceNodeAttrs>,
  "editor"
> => ({
  char: "~",
  pluginKey: referencePluginKey,
  allowedPrefixes: null,
  items: ({ query }) =>
    references
      .filter((reference) =>
        reference.title.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 10),
  render: () => {
    let component: ReactRenderer<ReferenceListRef, PReferenceList> | null =
      null;

    const positionMenu = (clientRect?: (() => DOMRect | null) | null) => {
      const rect = clientRect?.();
      const element = component?.element as HTMLElement | undefined;
      if (!rect || !element) {
        return;
      }
      element.style.left = `${rect.left + window.scrollX}px`;
      element.style.top = `${rect.bottom + window.scrollY}px`;
    };

    return {
      onStart: (props) => {
        component = new ReactRenderer(ReferenceList, {
          props: {
            items: props.items,
            command: props.command,
            onCreateNew: options.onCreateReference,
            onEdit: options.onEditReference,
          },
          editor: props.editor,
        });
        const element = component.element as HTMLElement;
        element.classList.add("tol-text-editor__reference-menu-wrapper");
        document.body.appendChild(element);
        positionMenu(props.clientRect);
      },
      onUpdate: (props) => {
        component?.updateProps({
          items: props.items,
          command: props.command,
          onCreateNew: options.onCreateReference,
          onEdit: options.onEditReference,
        });
        const element = component?.element as HTMLElement | undefined;
        if (element && !element.isConnected) {
          document.body.appendChild(element);
        }
        positionMenu(props.clientRect);
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          (component?.element as HTMLElement | undefined)?.remove();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        (component?.element as HTMLElement | undefined)?.remove();
        component?.destroy();
        component = null;
      },
    };
  },
});

/**
 * A tiptap node for citation references. Rendered to the user as a labelled
 * chip, but serialised behind the scenes as a `[~ref:<refId>]` token:
 * - `editor.getText()` yields the raw token via `renderText`
 * - `editor.getHTML()` yields a span carrying `data-id`/`data-url` plus a
 *   hidden inner span containing the token
 */
export const ReferenceExtension = (
  references: TextEditorReference[],
  options: ReferenceExtensionOptions,
) =>
  Mention.extend({
    name: "reference",

    addAttributes() {
      return {
        ...this.parent?.(),
        url: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("data-url"),
          renderHTML: (attributes: Record<string, string | null>) =>
            attributes.url ? { "data-url": attributes.url } : {},
        },
      };
    },

    parseHTML() {
      return [{ tag: `span[data-type="${this.name}"]` }];
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        "span",
        mergeAttributes(
          {
            "data-type": this.name,
            class: "tol-text-editor__reference",
            title: node.attrs.label,
          },
          HTMLAttributes,
        ),
        ["span", { hidden: "hidden" }, referenceToken(node.attrs.id)],
        [
          "span",
          { class: "tol-text-editor__reference-label" },
          node.attrs.label ?? node.attrs.id,
        ],
      ];
    },

    renderText({ node }) {
      return referenceToken(node.attrs.id);
    },
  }).configure({
    suggestion: referenceSuggestion(references, { ...options }),
  });
