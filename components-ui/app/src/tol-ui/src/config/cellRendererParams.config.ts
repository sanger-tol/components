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
  card: {
    rename: "Card",
    params: {
      content: {
        type: "markdown",
        rename: "Content",
        description: "Markdown-formatted content"
      },
      successBackground: {
        type: "condition",
        rename: "Success Background",
        description: "Condition for making the background the success colour"
      },
      warningBackground: {
        type: "condition",
        rename: "Warning Background",
        description: "Condition for making the background the success colour"
      },
      errorBackground: {
        type: "condition",
        rename: "Error Background",
        description: "Condition for making the background the success colour"
      }
    }
  },
  datetime: {
    rename: "DateTime",
    allowedDataTypes: ["datetime"]
  },
  float: {
    allowedDataTypes: ["float", "int"]
  },
  image: {
    description: "Displays an image inside of a cell, which can be enlarged by clicking on it.",
    params: {
      value: {
        type: "string",
        rename: "Image URL",
        required: true,
        description: "The URL or list of URLs of the image(s) to display",
        placeholder: "www.example.com/image.png"
      },
      captions: {
        type: "string",
        rename: "Caption",
        description: "The caption or list of captions for the image(s)",
        placeholder: "This is an image of a forest",
      },
    },
  },
  integer: {
    allowedDataTypes: ["int"]
  },
  link: {
    description: "Shows a clickable hyperlink in the cell.",
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
        required: true,
        description: "The text to display for the link, if empty it will default to the current field value",
        placeholder: "Click here",
      },
    }
  },
  linkGroups: {
    rename: "Link Groups",
    description: (
      "A means of displaying multiple links in one cell, " +
      "organised by group. All fields are optional."
    ),
    params: {
      firstGroupTitle: {
        type: "string",
        rename: "Group 1 Title",
        description: "The title of the first link group"
      },
      firstGroupFirstLink: {
        type: "string",
        rename: "🔗 Link 1",
        description: "The first link in group one"
      },
      firstGroupSecondLink: {
        type: "string",
        rename: "🔗 Link 2",
        description: "The second link in group one"
      },
      firstGroupThirdLink: {
        type: "string",
        rename: "🔗 Link 3",
        description: "The third link in group one"
      },
      firstGroupFourthLink: {
        type: "string",
        rename: "🔗 Link 4",
        description: "The fourth link in group one"
      },
      secondGroupTitle: {
        type: "string",
        rename: "Group 2 Title",
        description: "The title of the second link group"
      },
      secondGroupFirstLink: {
        type: "string",
        rename: "🔗 Link 1",
        description: "The first link in group two"
      },
      secondGroupSecondLink: {
        type: "string",
        rename: "🔗 Link 2",
        description: "The second link in group two"
      },
      secondGroupThirdLink: {
        type: "string",
        rename: "🔗 Link 3",
        description: "The third link in group two"
      },
      secondGroupFourthLink: {
        type: "string",
        rename: "🔗 Link 4",
        description: "The fourth link in group two"
      },
      thirdGroupTitle: {
        type: "string",
        rename: "Group 3 Title",
        description: "The title of the third link group"
      },
      thirdGroupFirstLink: {
        type: "string",
        rename: "🔗 Link 1",
        description: "The first link in group three"
      },
      thirdGroupSecondLink: {
        type: "string",
        rename: "🔗 Link 2",
        description: "The second link in group three"
      },
      thirdGroupThirdLink: {
        type: "string",
        rename: "🔗 Link 3",
        description: "The third link in group three"
      },
      thirdGroupFourthLink: {
        type: "string",
        rename: "🔗 Link 4",
        description: "The fourth link in group three"
      },
    }
  },
  longText: {
    rename: "Long Text",
    allowedDataTypes: ["str", "float", "int"],
    description: (
      "Shows a shortened version of the data. " +
      "The longer version can be seen by hovering over the cell."
    )
  },
  none: {},
  priority: {
    rename: "Priority",
    description: "Show an icon representing priority.",
    params: {
      highest: {
        type: "condition",
        rename: "Highest",
        description: "Condition for showing highest priority"
      },
      high: {
        type: "condition",
        rename: "High",
        description: "Condition for showing high priority"
      },
      medium: {
        type: "condition",
        rename: "Medium",
        description: "Condition for showing medium priority"
      },
      low: {
        type: "condition",
        rename: "Low",
        description: "Condition for showing low priority"
      },
      lowest: {
        type: "condition",
        rename: "Lowest",
        description: "Condition for showing lowest priority"
      }
    }
  },
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
    description: "Highlight the cell contents with colour to emphasise its status.",
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