# `falseIfUndefined`

Evaluates a given property and returns `true` if it is truthy, otherwise returns `false`.

## Parameters

- `prop`: The property to evaluate. This can be of any type.

## Returns

- `boolean`: Returns `true` if `prop` is truthy (i.e., not `undefined`, `null`, `false`, `0`, `""`, or `NaN`); otherwise, returns `false`.

## Example

```tsx
import { falseIfUndefined } from './Utils';

const definedProp = "example";
console.log(falseIfUndefined(definedProp)); // Output: true

const undefinedProp = "";
console.log(falseIfUndefined(undefinedProp)); // Output: false
