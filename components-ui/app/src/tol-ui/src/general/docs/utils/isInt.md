# `isInt`

## Description

Determines if the given value is an integer. This function checks whether a provided value is a number and if it is an integer by ensuring it has no decimal component.

## Props

- `n: any`: The value to be checked. It can be of any type, but the function will specifically determine if it's an integer number.

## Usage

```tsx
import { isInt } from './Utils';

console.log(isInt(5)); // Output: true
console.log(isInt(5.5)); // Output: false
console.log(isInt('5')); // Output: false
```

## Implementation

The function first converts the input to a number using the `Number` constructor. It then checks two conditions:

1. If the converted number is strictly equal to the input, ensuring that the input is indeed a number and not a numeric string or any other type.
2. If the modulo of 1 of the input is 0, which checks if there is no decimal part in the number.

If both conditions are met, the function returns `true`, indicating the input is an integer. Otherwise, it returns `false`.
