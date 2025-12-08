/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const AUTO_DOC_REGEX = /\/\*\*[\s\S]*?@autodoc[\s\S]*?\*\//g;
export const PROP_REGEX = /@prop\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*-?\s*(.*)/g;
export const EXAMPLE_REGEX = /@example\s*(.*?)\s*\n([\s\S]*?)(?=@\w+|$)/g;
