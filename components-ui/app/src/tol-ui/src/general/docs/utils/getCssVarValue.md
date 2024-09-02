# `getCssVarValue`

## Description

Retrieves the value of a CSS variable from the root document element. This function is useful for dynamically accessing CSS custom properties defined in the `:root` selector of a stylesheet.

## Props

- `variable: string`: The name of the CSS variable whose value is to be retrieved. It should include the double-dash prefix (`--`) as part of the variable name.

## Usage

```tsx
import { getCssVarValue } from './Utils';

const primaryColor = getCssVarValue('--primary-color');
console.log(primaryColor); // Outputs the value of --primary-color, e.g., "#ff5733"
```

## Implementation

The function utilizes the `getComputedStyle` method to access the styles computed for the root document element (`document.documentElement`). It then calls `getPropertyValue` on the returned `CSSStyleDeclaration` object, passing in the name of the CSS variable. This approach allows for the dynamic retrieval of CSS custom property values, enabling more flexible styling and theming capabilities within JavaScript.
