/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const CELL_RENDERER_PROP_TAG_START = "${";
export const CELL_RENDERER_PROP_TAG_END = "}";
export const CELL_RENDERER_PROP_ATTRIBUTE: RegExp = new RegExp(`\\${CELL_RENDERER_PROP_TAG_START}(.*?)\\${CELL_RENDERER_PROP_TAG_END}`, "g");
export const CELL_RENDERER_PROP_ATTRIBUTE_OBJECT_KEY: RegExp = /\[[^\]]*]/g;
export const CELL_RENDERER_SPREAD_OPERATOR: string = "...";
export const CELL_RENDERER_PARENT_OPERATOR = "~";

export const PROVENANCE_IN_FIELD_REGEX = /\[(.*)\]/;
export const ATTRIBUTE_NAME_AND_PROVENANCE_IN_FIELD_REGEX = /(.+)\[(.*)\]/;
export const PROVENANCE_IN_FIELD_REGEX_GLOBAL = /\[(.*)\]/g;
