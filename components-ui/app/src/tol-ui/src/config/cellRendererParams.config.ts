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
        placeholder: "https://www.example.com"
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
      firstGroupFirstLinkUrl: {
        type: "string",
        rename: "🔗 Link 1 URL",
        description: "The URL of the first link in group one"
      },
      firstGroupFirstLinkText: {
        type: "string",
        rename: "✏️ Link 1 Text",
        description: "The text to display for the first link in group one"
      },
      firstGroupSecondLinkUrl: {
        type: "string",
        rename: "🔗 Link 2 URL",
        description: "The URL of the second link in group one"
      },
      firstGroupSecondLinkText: {
        type: "string",
        rename: "✏️ Link 2 Text",
        description: "The text to display for the second link in group one"
      },
      firstGroupThirdLinkUrl: {
        type: "string",
        rename: "🔗 Link 3 URL",
        description: "The URL of the third link in group one"
      },
      firstGroupThirdLinkText: {
        type: "string",
        rename: "✏️ Link 3 Text",
        description: "The text to display for the third link in group one"
      },
      firstGroupFourthLinkUrl: {
        type: "string",
        rename: "🔗 Link 4 URL",
        description: "The URL of the fourth link in group one"
      },
      firstGroupFourthLinkText: {
        type: "string",
        rename: "✏️ Link 4 Text",
        description: "The text to display for the fourth link in group one"
      },
      secondGroupTitle: {
        type: "string",
        rename: "Group 2 Title",
        description: "The title of the second link group"
      },
      secondGroupFirstLinkUrl: {
        type: "string",
        rename: "🔗 Link 1 URL",
        description: "The URL of the first link in group two"
      },
      secondGroupFirstLinkText: {
        type: "string",
        rename: "✏️ Link 1 Text",
        description: "The text to display for the first link in group two"
      },
      secondGroupSecondLinkUrl: {
        type: "string",
        rename: "🔗 Link 2 URL",
        description: "The URL of the second link in group two"
      },
      secondGroupSecondLinkText: {
        type: "string",
        rename: "✏️ Link 2 Text",
        description: "The text to display for the second link in group two"
      },
      secondGroupThirdLinkUrl: {
        type: "string",
        rename: "🔗 Link 3 URL",
        description: "The URL of the third link in group two"
      },
      secondGroupThirdLinkText: {
        type: "string",
        rename: "✏️ Link 3 Text",
        description: "The text to display for the third link in group two"
      },
      secondGroupFourthLinkUrl: {
        type: "string",
        rename: "🔗 Link 4 URL",
        description: "The URL of the fourth link in group two"
      },
      secondGroupFourthLinkText: {
        type: "string",
        rename: "✏️ Link 4 Text",
        description: "The text to display for the fourth link in group two"
      },
      thirdGroupTitle: {
        type: "string",
        rename: "Group 3 Title",
        description: "The title of the third link group"
      },
      thirdGroupFirstLinkUrl: {
        type: "string",
        rename: "🔗 Link 1 URL",
        description: "The URL of the first link in group three"
      },
      thirdGroupFirstLinkText: {
        type: "string",
        rename: "✏️ Link 1 Text",
        description: "The text to display for the first link in group three"
      },
      thirdGroupSecondLinkUrl: {
        type: "string",
        rename: "🔗 Link 2 URL",
        description: "The URL of the second link in group three"
      },
      thirdGroupSecondLinkText: {
        type: "string",
        rename: "✏️ Link 2 Text",
        description: "The text to display for the second link in group three"
      },
      thirdGroupThirdLinkUrl: {
        type: "string",
        rename: "🔗 Link 3 URL",
        description: "The URL of the third link in group three"
      },
      thirdGroupThirdLinkText: {
        type: "string",
        rename: "✏️ Link 3 Text",
        description: "The text to display for the third link in group three"
      },
      thirdGroupFourthLinkUrl: {
        type: "string",
        rename: "🔗 Link 4 URL",
        description: "The URL of the fourth link in group three"
      },
      thirdGroupFourthLinkText: {
        type: "string",
        rename: "✏️ Link 4 Text",
        description: "The text to display for the fourth link in group three"
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