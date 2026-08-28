/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { DatePicker } from "rsuite";
import { CellEditableControls, PCellDisplay } from "../..";

export interface PCellEditableDatetime extends PCellDisplay {
	loading: boolean;
	floatingControls?: boolean;
	onChange: (newValue: string | Date) => void;
	onCancel: () => void;
	onSave: () => void;
}

export function CellEditableDatetime(props: PCellEditableDatetime) {
	const { value, loading, floatingControls, onChange, onCancel, onSave } =
		props;

	const [datePickerOpen, setDatePickerOpen] = useState(true);

	return (
		<>
			<DatePicker
				value={new Date(value)}
				onChange={(date) => {
					if (!date) return;
					onChange(date);
					setDatePickerOpen(false);
				}}
				cleanable={false}
				preventOverflow
				oneTap
				block
				open={datePickerOpen}
				onOpen={() => setDatePickerOpen(true)}
				onClose={() => setDatePickerOpen(false)}
				editable={false}
			/>
			<CellEditableControls
				loading={loading}
				floatingControls={floatingControls}
				onCancel={onCancel}
				onSave={onSave}
			/>
		</>
	);
}
