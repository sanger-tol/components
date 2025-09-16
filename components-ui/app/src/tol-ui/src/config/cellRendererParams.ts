import {
  TBoardParams,
  TCellRendererType
} from "..";


export const cellRendererParams = {
  relationship: {
    detailPageIdAttribute: {
      type: "string",
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
      required: true,
    },
    text: {
      type: "string",
      required: false,
    },
  },
} as Record<string, TBoardParams>;
// TODO: replace string with TCellRendeerType