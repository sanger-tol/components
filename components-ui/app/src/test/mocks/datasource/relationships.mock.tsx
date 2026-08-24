/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { TRelationships } from "../../../tol-ui/src";


export const relationshipConfigMock: TRelationships = {
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
