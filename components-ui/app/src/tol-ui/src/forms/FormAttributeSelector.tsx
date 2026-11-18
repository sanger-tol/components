/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AttributeSelector, FormComponentWrapper } from "..";
import type { PAttributeSelector, TFormComponentWrapper } from "..";

export interface PFormAttributeSelector
	extends Omit<PAttributeSelector, "attribute" | "setAttributes">,
		TFormComponentWrapper {
	name: string;
	value: string[];
	onChange: (value: string[]) => void;
	errorText?: string;
}

export function FormAttributeSelector(props: PFormAttributeSelector) {
	const { value, onChange, errorText, ...selectorProps } = props;

	return (
		<FormComponentWrapper {...props}>
			<AttributeSelector
				{...selectorProps}
				attribute={value}
				setAttributes={onChange}
			/>
		</FormComponentWrapper>
	);
}


