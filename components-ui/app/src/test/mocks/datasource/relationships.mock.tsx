/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IRelationships } from "../../../tol-ui/src";


export const relationshipConfigMock: IRelationships = {
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
