/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Table as RSTable } from "rsuite";
import {
	AttributeTitle,
	Filter,
	IFilterInputType,
	Sort,
	FieldDropdown,
	AutoHeightCell,
	PTable,
	Field
} from "..";


export interface PDataColumn extends PTable {
	fieldKey: string;
	field: Field;
	sortable: boolean;
	filterable: boolean;
	handleCellHeightChange: (
		rowId: string,
		columnId: string,
		height: number
	) => void;
}

export function DataColumn(props: PDataColumn) {
	const {
		id,
		data,
		fieldKey,
		field,
		sortable,
		filterable,
		filterVisibility,
		copySeparator,
		fieldDropdownChoices,
		handleCellHeightChange,
	} = props;

	const { Column, HeaderCell, Cell } = RSTable;

	return (
		<Column
			key={fieldKey}
			width={field.width || 200}
			sortable={sortable}
			fixed={field.fixed}
		>
			<HeaderCell>
				<AttributeTitle
					{...props}
					attributeId={fieldKey}
					className="tol-header-text"
					rename={field.rename!}
				/>
				{filterable && (
					<span
						className={
							filterVisibility ? "tol-filter" : "tol-filter-hide"
						}
					>
						<Filter
							{...props}
							attribute={fieldKey}
							rename={field.rename!}
							type={field.filter as IFilterInputType}
							componentId={id}
						/>
					</span>
				)}
				<Sort
					{...props}
					attribute={fieldKey}
					sortable={sortable}
				/>
				{!field.custom && (
					<FieldDropdown
						{...props}
						attribute={fieldKey}
						data={data}
						separator={copySeparator}
						choices={fieldDropdownChoices}
					/>
				)}
			</HeaderCell>
			<Cell>
				{(rowData: any) => (
					<AutoHeightCell
						rowId={rowData?.key}
						columnId={fieldKey}
						onHeightChange={handleCellHeightChange}
					>
						{rowData[fieldKey]}
					</AutoHeightCell>
				)}
			</Cell>
		</Column>
	);
}