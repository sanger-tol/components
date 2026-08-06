/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const NO_FILTERS_APPLIED = "No filters applied, click here to add...";

export const FILTER_ALREADY_EXISTS =
	"A filter already exists in the filtering system. Please remove it before adding this filter.";

export const FILTER_INPUT_DELAY = 800;

export const FILTER_PASS_THROUGH = {
	LABEL: "Apply these filters only to this item.",
	TOOLTIP:
		"Toggling this on means this filter does not affect other items in the hierarchy. Filters from above are still applied.",
};

export const FILTER_EXCLUDE_INCOMING = {
	LABEL_ZONE: "Exclude incoming filters from the Zone above.",
	LABEL_COMPONENT: "Exclude incoming filters from the Components above.",
	TOOLTIP_ZONE:
		"Toggling this on means this Zone does not inherit filters from the Zone above.",
	TOOLTIP_COMPONENT:
		"Toggling this on means this Component does not inherit filters from the Components above. The Zone filters are still applied if applicable.",
};

export const ADVANCED_TRANSLATION = {
	LABEL: "Use advanced translations.",
	TOOLTIP:
		"Toggling this allows you to specify a mapping of custom translations. These are prioritised over automatic translations. This is formatted using JSON.",
};
