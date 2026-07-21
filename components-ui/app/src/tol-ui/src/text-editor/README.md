<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Text editor

The text editor is a rich text editing component built on [Tiptap](https://tiptap.dev/). It pairs an editable content area with a configurable formatting toolbar (the menu bar).

In practice, it is used wherever the application needs formatted user input, with the content returned to the consumer as HTML, JSON or plain text.

## How it works

The editor wraps a Tiptap instance configured with a standard set of extensions: StarterKit, Highlight, Superscript, Subscript and TextAlign.

When the content changes:

- the editor serialises its document according to `returnValueType`
- `"json"` (the default) returns the document structure as a JSON string
- `"html"` returns an HTML string
- `"text"` returns plain text with formatting stripped

The rendered component is made up of three parts:

- the menu bar at the top
- the editable content area
- an optional footer, typically used for keyboard shortcut hints

The editor can also be made read-only via the `editable` prop, and consumers can access the underlying Tiptap instance through `onEditorChange` for advanced use cases.

## The menu bar

The menu bar renders the formatting toolbar for the editor. It is rendered automatically by the text editor and is not used on its own.

Which standard buttons appear is controlled by the `menuButtons` prop:

- the order of names in the array determines toolbar order
- valid names are defined by the `TTextEditorButton` type, covering marks (bold, italic, underline, strike, code, highlight, super/subscript), block types (paragraph, headings 1–4, block quote, code block, lists), alignment and links
- undo and redo are always shown, regardless of configuration

Nothing is rendered until the editor instance is available.

## Custom extensions and buttons

The editor can be extended beyond the standard feature set.

Custom extensions:

- passed via `customExtensions`, added alongside the standard extensions
- the array must be referentially stable (a module-level constant or `useMemo`), otherwise the editor is rebuilt on every render and loses focus and selection

Custom buttons:

- passed via `customButtons`, rendered in the toolbar before undo and redo
- each entry can be a button props object, a React element, or a function that receives the editor instance and returns either

This allows features such as tables or mentions to be added by a consumer without changing the shared component.
