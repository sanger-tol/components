/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Configuration for running a translator test against mutliple combinations of zones and table fields
export const TRANSLATOR_TEST_INPUTS = [
  { zoneObjectTypes: ['species', 'sample'], TableFields: { 'species': ['sts_scientific_name'], 'sample': ['benchling_species.sts_scientific_name'] } },
  { zoneObjectTypes: ['sample', 'species'], TableFields: { 'species': ['sts_scientific_name'], 'sample': ['benchling_species.sts_scientific_name'] } },
  { zoneObjectTypes: ['sample', 'tolid'], TableFields: { 'sample': ['benchling_species.sts_scientific_name'], 'tolid': ['tolid_species.sts_scientific_name'] } },
];