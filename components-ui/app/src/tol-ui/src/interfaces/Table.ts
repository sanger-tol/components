/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FieldMeta } from "..";

export interface ITableConfigSave {
	fieldMeta?: FieldMeta;
	filterVisibility?: boolean;
	pageSize?: number;
	actions?: string[];
	sortByAttribute?: string;
	sortByType?: string;
}
