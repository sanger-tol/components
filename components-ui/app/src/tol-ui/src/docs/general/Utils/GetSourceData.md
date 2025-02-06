# getSourceData Function

## Description

The `getSourceData` function retrieves the source data for a given attribute from the provided field metadata.

## Parameters

The `getSourceData` function accepts the following parameters:

- `fieldMeta` (required, FieldMeta): The metadata object containing data about various fields.
- `attribute` (required, string): The attribute for which the source data is to be retrieved.

## Returns

- `string`: The source data for the specified attribute. Returns an empty string if the attribute or source data is not found.

## Usage

```tsx
import { getSourceData } from "./path/to/Utils";

// simplified example of fieldMeta object
const fieldMeta = {
  data: {
    attribute1: { source: "source1" },
    attribute2: { source: "source2" },
  },
};

const attribute = "attribute1";
const sourceData = getSourceData(fieldMeta, attribute);
console.log(sourceData); // Output: 'source1'
```

## Implementation

The getSourceData function accesses the data property of the fieldMeta object and retrieves the source data for the specified attribute. If the attribute or source data is not found, it returns an empty string.
