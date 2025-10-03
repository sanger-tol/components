/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TBoardParams,
} from "..";


export const cellRendererParams = {
  boolean: {},
  datetime: {},
  expander: {},
  float: {},
  image: {},
  integer: {},
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
  list: {},
  relationship: {
    detailPageIdAttribute: {
      type: "string",
      rename: "ID Attribute",
      required: false,
      description: "The name of the field that holds the ID for the detail page link",
      previewExample: "id"
    },
  },
  status: {
    info: {
      type: "boolean",
      rename: "Info",
      required: false,
      description: "Logic for displaying an info status",
    },
    success: {
      type: "boolean",
      rename: "Success",
      required: false,
      description: "Logic for displaying a success status",
    },
    warning: {
      type: "boolean",
      rename: "Warning",
      required: false,
      description: "Logic for displaying a warning status",
    },
    danger: {
      type: "boolean",
      rename: "Danger",
      required: false,
      description: "Logic for displaying a danger status",
    },
  },
} as Record<string, TBoardParams>;