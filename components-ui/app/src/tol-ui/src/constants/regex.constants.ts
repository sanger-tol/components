/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const PARAM_TAG_START = "${";
export const PARAM_TAG_END = "}";
export const PARAM_ATTRIBUTE: RegExp = new RegExp(`\\${PARAM_TAG_START}(.*?)\\${PARAM_TAG_END}`, "g");
export const PARAM_ATTRIBUTE_OBJECT_KEY: RegExp = /\[[^\]]*]/g;
export const SPREAD_OPERATOR: string = "...";
export const ORIGIN_OPERATOR = "~";

export const PROVENANCE_IN_FIELD_REGEX = /\[(.*)\]/;
export const ATTRIBUTE_NAME_AND_PROVENANCE_IN_FIELD_REGEX = /(.+)\[(.*)\]/;
export const PROVENANCE_IN_FIELD_REGEX_GLOBAL = /\[(.*)\]/g;
