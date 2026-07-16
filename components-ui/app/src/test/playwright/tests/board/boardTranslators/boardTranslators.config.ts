/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


export const SPECIES_TABLE_CONFIG = {
  "fieldMeta": {
    "data": {},
    "order": {
      "active": [
        "sts_scientific_name"
      ],
      "inactive": [],
      "limitVisibility": false
    }
  }
}

export const SAMPLE_TABLE_CONFIG = {
  "fieldMeta": {
    "data": {},
    "order": {
      "active": [
        "sts_species.sts_scientific_name"
      ],
      "inactive": [],
      "limitVisibility": false
    }
  }
}