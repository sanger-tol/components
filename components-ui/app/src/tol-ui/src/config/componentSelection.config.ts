/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const componentOptions = [
  {
    type: "statistics",
    text: "Statistics",
    icon: "hashtag",
    disabled: false,
    defaultSize: "sm",
  },
  {
    type: "sunburst",
    text: "Sunburst",
    icon: "chart-pie",
    disabled: false,
    defaultSize: "lg",
  },
  {
    type: "table",
    text: "Table",
    icon: "table",
    disabled: false,
    defaultSize: "lg",
  },
  {
    type: "chart",
    text: "Chart",
    icon: "chart-column",
    disabled: false,
    defaultSize: "lg",
  },
  {
    type: "text",
    text: "Text",
    icon: "font",
    disabled: false,
    defaultSize: "md",
  },
  {
    type: "filterBlock",
    text: "Filter Block",
    icon: "filter",
    disabled: false,
  },
  {
    type: "map",
    text: "Map",
    icon: "location-dot",
    disabled: true,
    defaultSize: "lg",
  },
];

export const sizeOptions = (componentType: string) => {
  return [
    {
      type: "sm",
      text: "Small",
      disabled: componentType === "table" || componentType == "chart",
    },
    {
      type: "md",
      text: "Medium",
      disabled: componentType === "statistics",
    },
    {
      type: "lg",
      text: "Large",
      disabled: componentType === "statistics",
    },
  ]
}
