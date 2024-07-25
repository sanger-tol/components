/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface Attributes {
	[id: string]: object
}

interface Relationships {
	[id: string]: Relationship
}

interface Relationship {
	one?: Values,
	many?: Values,
	foreign_keys?: Values
}

interface Values {
	[id: string]: string
}

export interface EntityMeta {
	attributes: Attributes,
	relationships: Relationships
}
