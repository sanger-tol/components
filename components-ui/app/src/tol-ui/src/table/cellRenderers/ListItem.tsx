/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PCell } from "./Cell";


export function ListItem(props: PCell) {
  const { value } = props;

	return (
		<div className="tol-collection-list-item">
			{value}
		</div>
	);

}