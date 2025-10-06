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
      placeholder: "www.example.com"
    },
    text: {
      type: "string",
      rename: "Text",
      description: "The text to display for the link, if empty it will default to the current field value",
      placeholder: "This is a link",
    },
  },
  list: {},
  relationship: {
    detailPageIdAttribute: {
      type: "string",
      rename: "ID Attribute",
      description: "The name of the field that holds the ID for the detail page link",
      placeholder: "id",
    },
  },
  status: {
    info: {
      type: "boolean",
      rename: "Info",
      description: "Condition for displaying an info status",
    },
    success: {
      type: "boolean",
      rename: "Success",
      description: "Condition for displaying a success status",
    },
    warning: {
      type: "boolean",
      rename: "Warning",
      description: "Condition for displaying a warning status",
    },
    danger: {
      type: "boolean",
      rename: "Danger",
      description: "Condition for displaying a danger status",
    },
  },
} as Record<string, TBoardParams>;