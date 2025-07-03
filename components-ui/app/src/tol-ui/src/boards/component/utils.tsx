/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARDS, getWidgetOrder, IZone, TsDataSource } from "../..";


export function deleteComponent(id: string, boardDataSource: TsDataSource) {
	boardDataSource
		.deleteByID({
			objectType: BOARDS.COMPONENT,
			id: id,
		})
}

export async function onLayoutSave(
	layout,
	boardDataSource: TsDataSource,
	setSaveLayout: (value: boolean) => void,
	widgets,
	setWidgets,
	zone: IZone,
	setZone: (zone: IZone) => void,
) {
	// gets the order based off of the layout on screen
	const order = getWidgetOrder(layout);

	// finds the highest order value in the current widgets, based off the db
	const orderValues = widgets.map((widget) => Number(widget.order));
	const highestPreviousOrder = Math.max(...orderValues);

	// maps through the order and upserts based off of the componentId
	const payloadData = order.order.map((componentId, index) => {
		const widget = widgets.find(
			(widget) => widget.componentId === componentId,
		);
		widget!.order = highestPreviousOrder + 1 + index;
		return {
			type: BOARDS.COMPONENT_ZONE as string,
			id: widget!.componentZoneId,
			attributes: {
				order: highestPreviousOrder + index + 1,
			},
		};
	});
	await boardDataSource.upsert({
		objectType: BOARDS.COMPONENT_ZONE,
		payload: payloadData,
	});
	setSaveLayout(false);
	zone.order = order.order;
	setZone({ ...zone });
	setWidgets(widgets);
};