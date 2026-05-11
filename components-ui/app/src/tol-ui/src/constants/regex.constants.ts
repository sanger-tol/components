/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const CELL_RENDERER_PROP_TAG_START = "${";
export const CELL_RENDERER_PROP_TAG_END = "}";
export const CELL_RENDERER_PROP_ATTRIBUTE = new RegExp(`\\${CELL_RENDERER_PROP_TAG_START}(.*?)\\${CELL_RENDERER_PROP_TAG_END}`, "g");
export const CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY = /\[[^\]]*]/g;
export const CELL_RENDERER_SPREAD_OPERATOR = "...";
export const CELL_RENDERER_PARENT_OPERATOR = "~";
