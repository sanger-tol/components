# `isEmptyObject`

## Description

Checks if the provided object is empty (i.e., has no own enumerable properties).

## Props

- `x: object`: The object to check for emptiness.

## Usage

```tsx
import { isEmptyObject } from './Utils';

const myObject = {};
const isMyObjectEmpty = isEmptyObject(myObject); // true
```

## Implementation

The function utilizes `Object.keys(x)` to retrieve an array of the object's own enumerable property names. It then checks if the length of this array is 0, which indicates that the object has no own enumerable properties, thus is considered empty.
