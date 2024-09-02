# `isPropDefined`

Determines if a given property is defined.

## Parameters

- `prop`: The property to check. This can be of any type.

## Returns

- `boolean`: Returns `true` if the property is not `undefined`; otherwise, returns `false`.

## Example

```tsx
import { isPropDefined } from './Utils';

const exampleProp = "example";
console.log(isPropDefined(exampleProp)); // Output: true

const undefinedProp = undefined;
console.log(isPropDefined(undefinedProp)); // Output: false
