/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * This file is used to ensure that the TypeScript compiler includes the types for all Tiptap extensions used in the project. 
 * By importing the types from each extension, we can leverage TypeScript's type checking and autocompletion features when working with Tiptap in our codebase.
 * This is required to fix types when building the project with TypeScript 6.0.3, as it ensures that all necessary types are included in the compilation process.
 * 
 * Note: This file does not contain any executable code and is only used for type declarations.
 */
import type {} from "@tiptap/extension-blockquote";
import type {} from "@tiptap/extension-bold";
import type {} from "@tiptap/extension-code";
import type {} from "@tiptap/extension-code-block";
import type {} from "@tiptap/extension-heading";
import type {} from "@tiptap/extension-italic";
import type {} from "@tiptap/extension-link";
import type {} from "@tiptap/extension-list";
import type {} from "@tiptap/extension-paragraph";
import type {} from "@tiptap/extension-strike";
import type {} from "@tiptap/extension-underline";
import type {} from "@tiptap/extensions";
