<!--
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# getAttributeSources Function

## Description

The `getAttributeSources` function retrieves a list of unique attribute sources from the provided entity metadata for a given endpoint.

## Parameters

The `getAttributeSources` function accepts the following parameters:

- `entityMeta` (required, any): The metadata object containing information about various entities and their attributes.
- `endpoint` (required, string): The endpoint for which the attribute sources are to be retrieved.

## Returns

- `string[]`: An array of unique attribute sources, including "all" and "undefined".

## Usage

```tsx
import { getAttributeSources } from "./path/to/utils";

// Simplified example of entity metadata
const entityMeta = {
  flatAttributes: {
    endpoint1: {
      attribute1: { source: "mlwh" },
      attribute2: { source: "sts" },
    },
  },
};

const endpoint = "species";
const sources = getAttributeSources(entityMeta, endpoint);
console.log(sources); // Output: ['all', 'mlwh', 'sts', 'undefined']
```

## Implementation

- The getAttributeSources function initializes a set of sources with "all".
- It then checks if the entityMeta object contains flatAttributes for the specified endpoint.
- If so, it iterates over the attributes and adds their sources to the set.
- Finally, it adds "undefined" to the set and returns the sources as an array.
