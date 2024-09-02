# `deepCopy`

## Description

Creates a deep copy of the provided object. This function is useful for duplicating objects without retaining references to the original object's properties, ensuring that changes to the copied object do not affect the original.

## Props

- `o: object`: The object to be copied. It can be of any shape or complexity.

## Usage

```tsx
import { deepCopy } from './Utils';

const originalObject = { a: 1, b: { c: 2 } };
const copiedObject = deepCopy(originalObject);

console.log(copiedObject); // Output: { a: 1, b: { c: 2 } }
console.log(copiedObject === originalObject); // Output: false
```

## Implementation

The `deepCopy` function works by first checking if the input object is `undefined`; if so, it returns an empty object to avoid errors. For other cases, it leverages the `JSON.parse` and `JSON.stringify` methods to serialize the input object into a string and then parse that string back into a new object. This process effectively creates a new object with the same properties as the original but without sharing references, achieving a deep copy. However, it's worth noting that this method does not support copying functions, `Date` objects, `RegExp` objects, and other complex types in their original form.
