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
    rename: "DateTime",
    allowedDataTypes: ["datetime"]
  },
  float: {
    allowedDataTypes: ["float", "int"]
  },
  image: {
    params: {
      value: {
        type: "string",
        rename: "Image URL",
        required: true,
        description: "The URL or list of URLs of the image(s) to display",
        placeholder: "www.example.com/image.png"
      },
      names: {
        type: "string",
        rename: "Caption",
        description: "The caption or list of captions for the image(s)",
        placeholder: "This is an image of a forest",
      },
    },
    allowedDataTypes: ["str"]
  },
  integer: {
    allowedDataTypes: ["int"]
  },
  link: {
    params: {
      url: {
        type: "string",
        rename: "URL",
        required: true,
        description: "The URL to link to. Ensure external links prefix with 'http://' or 'https://'",
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
  longText: {
    rename: "Long Text",
    allowedDataTypes: ["str", "float", "int"]
  },
  none: {},
  relationship: {
    params: {
      relationshipId: {
        type: "string",
        rename: "Relationship ID",
        description: "The ID used in the detail page URL for the related object",
        placeholder: "id",
      },
    }
  },
  trafficLightStatus: {
    rename: "Traffic Light Status",
    params: {
      success: {
        type: "condition",
        rename: "Success",
        description: "Condition for displaying a success status",
      },
      warning: {
        type: "condition",
        rename: "Warning",
        description: "Condition for displaying a warning status",
      },
      danger: {
        type: "condition",
        rename: "Danger",
        description: "Condition for displaying a danger status",
      },
    }
  },
};