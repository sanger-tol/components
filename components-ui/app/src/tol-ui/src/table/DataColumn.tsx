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


export interface DataColumnProps extends PTable {
	key: string;
	field: Field;
	sortable: boolean;
	filterable: boolean;
	handleCellHeightChange: (
		rowId: string,
		columnId: string,
		height: number
	) => void;
}

export function DataColumn(props: DataColumnProps) {
	const {
		id,
		data,
		key,
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
			key={key}
			width={field.width || 200}
			sortable={sortable}
			fixed={field.fixed}
		>
			<HeaderCell>
				<AttributeTitle
					{...props}
					attributeId={key}
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
							attribute={key}
							rename={field.rename!}
							type={field.filter as IFilterInputType}
							componentId={id}
						/>
					</span>
				)}
				<Sort
					{...props}
					attribute={key}
					sortable={sortable}
				/>
				{!field.custom && (
					<FieldDropdown
						{...props}
						attribute={key}
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
						columnId={key}
						onHeightChange={handleCellHeightChange}
					>
						{rowData[key]}
					</AutoHeightCell>
				)}
			</Cell>
		</Column>
	);
}