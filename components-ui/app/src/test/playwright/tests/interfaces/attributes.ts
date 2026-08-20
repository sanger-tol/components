// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

/**
 * A record mapping attributes to which provenances are selected for them.
 * If an attribute has a `null` provenance, it means we're only referring to the attribute itself
 * (likely because this is not a provenanced attribute).
 * If "calc" is in the provenance list, that means that the calculated 'overall' field is part
 * of the provenances selection.
 */
export type TAttributeAndProvenanceList = Record<string, string[] | null>;
