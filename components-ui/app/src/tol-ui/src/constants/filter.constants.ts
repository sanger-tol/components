/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const NO_FILTERS_APPLIED = "No filters applied, click here to add...";

export const FILTER_ALREADY_EXISTS =
	"A filter already exists in the filtering system. Please remove it before adding this filter.";

export const FILTER_INPUT_DELAY = 800;

export const ATTRIBUTE_TRANSLATIONS_PLACEHOLDER =
	'{"above_zone_field_id": "current_zone_field_id"}';

export const FILTER_PASS_THROUGH = {
	LABEL: (type: string) => `Apply the following filters only to this ${type}`,
	TOOLTIP:
		"Toggling this on means this filter does not affect other items in the hierarchy. Filters from above are still applied.",
};

export const FILTER_EXCLUDE_INCOMING = {
	LABEL_ZONE: "Exclude incoming filters from the Zone above",
	LABEL_COMPONENT: "Exclude incoming filters from the Components above",
	TOOLTIP_ZONE:
		"Toggling this on means this Zone does not inherit filters from the Zone above.",
	TOOLTIP_COMPONENT:
		"Toggling this on means this Component does not inherit filters from the Components above. The Zone filters are still applied if applicable.",
};

export const ATTRIBUTE_TRANSLATION = {
	LABEL: "Attribute translation",
	TOOLTIP:
		"Toggling this allows you to specify a mapping of custom translations. These are prioritised over automatic translations. This is formatted using JSON.",
};

export const RELATIONSHIP_TRANSLATION = {
	LABEL: "Relationship translation",
	TOOLTIP:
		"Toggling this on enables relationship translation of incoming filters between related zones.",
};

export const RELATIONSHIP_PATH_PLACEHOLDER = "Select a relationship to start building the path";
export const TRANSLATOR_DISABLED_TEXT = "Translators are disabled for this Zone. You can only configure them when the Zone above can pass filters down and this Zone is not excluding incoming filters.";