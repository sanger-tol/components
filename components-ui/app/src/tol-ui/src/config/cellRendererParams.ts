/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IBoardCellRenderers,
} from "..";


export const cellRendererParams: IBoardCellRenderers = {
  boolean: {
    allowedDataTypes: ["bool"]
  },
  datetime: {
    allowedDataTypes: ["datetime"]
  },
  expander: {},
  float: {
    allowedDataTypes: ["float", "int"]
  },
  image: {},
  integer: {
    allowedDataTypes: ["int"]
  },
  link: {
    params: {
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
    }
  },
  list: {},
  relationship: {
    params: {
      detailPageIdAttribute: {
        type: "string",
        rename: "ID Attribute",
        description: "The name of the field that holds the ID for the detail page link",
        placeholder: "id",
      },
    }
  },
  status: {
    params: {
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
    }
  },
};