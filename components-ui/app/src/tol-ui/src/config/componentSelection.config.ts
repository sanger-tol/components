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
    defaultSize: "lg"
  },
  {
    type: "map",
    text: "Map",
    icon: "location-dot",
    disabled: false,
    defaultSize: "lg",
  },
];

const SMALL_DISABLED = ["table", "chart", "filterBlock", "map"];
const MEDIUM_DISABLED = ["count", "filterBlock", "statistics"];
const LARGE_DISABLED = ["statistics", "count"];

export const sizeOptions = (componentType: string) => {
  return [
    {
      type: "sm",
      text: "Small",
      disabled: SMALL_DISABLED.includes(componentType),
    },
    {
      type: "md",
      text: "Medium",
      disabled: MEDIUM_DISABLED.includes(componentType),
    },
    {
      type: "lg",
      text: "Large",
      disabled: LARGE_DISABLED.includes(componentType),
    },
  ]
}
