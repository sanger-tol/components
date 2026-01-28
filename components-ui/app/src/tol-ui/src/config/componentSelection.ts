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
    type: "text",
    text: "Text",
    icon: "font",
    disabled: false,
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
  },
];

export const sizeOptions = (componentType: string) => {
  return [
    {
      type: "sm",
      text: "Small",
      disabled: componentType === "table" || componentType === "chart",
    },
    {
      type: "md",
      text: "Medium",
      disabled: componentType === "count" || componentType === "filterBlock",
    },
    {
      type: "lg",
      text: "Large",
      disabled: componentType === "count" || componentType === "filterBlock",
    },
  ]
}