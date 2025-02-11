<!--
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# getFlattenedMetaData Function

## Description

The `getFlattenedMetaData` function retrieves flattened metadata for a given endpoint and optionally for a specific attribute from the provided entity metadata.

## Parameters

The `getFlattenedMetaData` function accepts the following parameters:

- `entityMeta` (required, any): The metadata object containing information about various entities and their attributes.
- `endpoint` (required, string): The endpoint for which the flattened metadata is to be retrieved.
- `attribute` (optional, string): The specific attribute for which the flattened metadata is to be retrieved.

## Returns

- `object {} or {{}, {}...}`: The flattened metadata for the specified endpoint and attribute. If the attribute is not provided, it returns the flattened metadata for the entire endpoint.

## Usage

```tsx
import { getFlattenedMetaData } from "./path/to/Utils";

// Simple Example of entityMeta data
const entityMeta = {
  flatAttributes: {
    endpoint1: {
      attribute1: { source: "source1", type: "type1" },
      attribute2: { source: "source2", type: "type2" },
    },
  },
};

const endpoint = "endpoint1";
const attribute = "attribute1";
const flattenedMetaData = getFlattenedMetaData(entityMeta, endpoint, attribute);
console.log(flattenedMetaData); // Output: { source: 'source1', type: 'type1' }

const allFlattenedMetaData = getFlattenedMetaData(entityMeta, endpoint);
console.log(allFlattenedMetaData); // Output: { 
// attribute1: { source: 'source1', type: 'type1' }, 
// attribute2: { source: 'source2', type: 'type2' } }
```

## Implementation

- The getFlattenedMetaData function checks if an attribute is provided.
- If so, it retrieves the flattened metadata for that specific attribute from the entityMeta object for the given endpoint.
- If the attribute is not provided, it retrieves the flattened metadata for the entire endpoint.
