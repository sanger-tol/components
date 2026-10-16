/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Configuration for running a translator test against mutliple combinations of zones and table fields
export const TRANSLATOR_TEST_INPUTS = [
  { zoneObjectTypes: ['species', 'sample'], TableFields: { 'species': ['scientific_name'], 'sample': ['species.scientific_name'] } },
  { zoneObjectTypes: ['sample', 'species'], TableFields: { 'species': ['scientific_name'], 'sample': ['species.scientific_name'] } },
  { zoneObjectTypes: ['sample', 'tolid'], TableFields: { 'sample': ['species.scientific_name'], 'tolid': ['species.scientific_name'] } },
];