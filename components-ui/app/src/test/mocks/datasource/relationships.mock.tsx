/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TRelationships } from "../../../tol-ui/src";


export const relationshipConfigMockRelational: TRelationships = {
  species: {
    one: {},
    many: { specimens: "specimen" },
    foreign_keys: {},
  },
  specimen: {
    one: { species: "species" },
    many: { samples: "sample" },
    foreign_keys: {},
  },
  sample: {
    one: { specimen: "specimen" },
    many: {},
    foreign_keys: {},
  },
};

export const relationshipConfigMockFlattened: TRelationships = {
  species: {
    one: {},
    many: {
      specimens: "specimen",
      samples: "sample",
    },
    foreign_keys: {},
  },
  specimen: {
    one: { species: "species" },
    many: { samples: "sample" },
    foreign_keys: {},
  },
  sample: {
    one: {
      species: "species",
      specimen: "specimen",
    },
    many: {},
    foreign_keys: {},
  },
};
