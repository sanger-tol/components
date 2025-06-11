/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const componentOptions = [
  {
    type: "count",
    text: "Count",
    icon: "hashtag",
    disabled: false,
  },
  {
    type: "sunburst",
    text: "Sunburst",
    icon: "chart-pie",
    disabled: false,
  },
  {
    type: "table",
    text: "Table",
    icon: "table",
    disabled: false,
  },
  {
    type: "chart",
    text: "Chart",
    icon: "chart-column",
    disabled: false,
  },
  {
    type: "map",
    text: "Map",
    icon: "location-dot",
    disabled: true,
  },
  {
    type: "text",
    text: "Text",
    icon: "font",
    disabled: false,
  }
];

export const sizeOptions = (componentType: string) => {
  return [
    {
      type: "sm",
      text: "Small",
      disabled: componentType === "count" || componentType == "sunburst" || componentType === "text" ? false : true,
    },
    {
      type: "md",
      text: "Medium",
      disabled: componentType === "count" ? true : false,
    },
    {
      type: "lg",
      text: "Large",
      disabled: componentType === "count" ? true : false,
    },
  ]
}