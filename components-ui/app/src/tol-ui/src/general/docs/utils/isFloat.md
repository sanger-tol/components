# `isFloat`

## Description

Determines if the given value is a floating-point number. This function checks whether a provided value is a number and if it has a decimal component, distinguishing it from integers.

## Props

- `n: any`: The value to be checked. It can be of any type, but the function specifically determines if it's a floating-point number.

## Usage

```tsx
import { isFloat } from './Utils';

console.log(isFloat(5)); // Output: false
console.log(isFloat(5.5)); // Output: true
console.log(isFloat('5.5')); // Output: false
```

## Implementation

The function employs a two-step check to determine if the input is a floating-point number:

1. It first converts the input to a `number` using the Number constructor and checks if the result is strictly equal to the original input. This step ensures that the input is a number.
2. It then checks if the modulo of 1 of the input is not equal to 0. This step verifies the presence of a decimal component in the number.

If both conditions are satisfied, the function concludes that the input is a floating-point number and returns `true`. Otherwise, it returns `false`.
