<!--
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# filterBySource Function

## Description

The `filterBySource` function is used to filter a list of selected sources based on a given source. It updates the list of selected sources by either adding or removing the specified source.

It is mainly used in the `AttributeSelector` component.

## Parameters

The `filterBySource` function accepts the following parameters:

- `source` (required, string): The source to filter by. Special values include "all" and "undefined".
- `selectedSources` (required, string[]): The current list of selected sources.
- `setSelectedSources` (required, function): A function to update the list of selected sources.

## Usage

```tsx
import { filterBySource } from "./path/to/utils";

const [selectedSources, setSelectedSources] = useState<string[]>([]);

sources.map((source: string, index: number) => (
  <div
    key={index}
    className="tol-attribute-selector-sources-inner-container"
    onClick={() => filterBySource(source, selectedSources, setSelectedSources)}
  >
    Filter by this.source
  </div>
));
```

## Implementation

The filterBySource function checks the provided source and updates the selectedSources list accordingly:

- If the source is "all", it clears the selectedSources list, as `!selectedSources` shows all sources.
- If the source is "undefined", it toggles the presence of "undefined" in the selectedSources list, shows metadata for undefined sources.
- For any other source, it toggles the presence of that source in the selectedSources list.
- If one or more sources is already in the array, it appends the source to the array.
