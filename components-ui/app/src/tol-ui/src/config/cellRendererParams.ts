import {
  TBoardParams,
} from "..";


export const cellRendererParams = {
  relationship: {
    detailPageIdAttribute: {
      type: "string",
      rename: "ID Attribute",
      required: false,
    },
  },
  datetime: {},
  boolean: {},
  image: {},
  list: {},
  expander: {},
  float: {},
  integer: {},
  link: {
    url: {
      type: "string",
      rename: "URL",
      required: true,
    },
    text: {
      type: "string",
      rename: "Text",
      required: false,
    },
  },
} as Record<string, TBoardParams>;
