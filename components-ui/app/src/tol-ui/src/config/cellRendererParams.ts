/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TBoardParams,
} from "..";


export const cellRendererParams = {
  relationship: {
    detailPageIdAttribute: {
      type: "string",
      rename: "ID Attribute",
      required: false,
      description: "The name of the field that holds the ID for the detail page link",
      previewExample: "id"
    },
  },
  link: {
    url: {
      type: "string",
      rename: "URL",
      required: true,
      description: "The URL to link to",
      previewExample: "www.example.com"
    },
    text: {
      type: "string",
      rename: "Text",
      required: false,
      description: "The text to display for the link, if empty it will default to the current field value",
      previewExample: "This is a link"
    },
  },
  datetime: {},
  boolean: {},
  image: {},
  list: {},
  expander: {},
  float: {},
  integer: {},
} as Record<string, TBoardParams>;
