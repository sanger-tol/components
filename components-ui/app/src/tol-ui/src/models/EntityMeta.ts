/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface Values {
	[id: string]: string
}

interface Relationship {
	one?: Values,
	many?: Values,
	foreign_keys?: Values
}

export interface Attributes {
	[objectType: string]: object
}

export interface Relationships {
	[objectType: string]: Relationship
}

export interface EntityMeta {
	attributes: Attributes,
	relationships: Relationships
}
