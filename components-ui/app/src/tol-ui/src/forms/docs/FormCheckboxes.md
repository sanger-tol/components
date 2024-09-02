# FormCheckboxes Component

## Description

`FormCheckboxes` is a React component designed to render a group of checkboxes within a form. It utilizes the `rsuite` library for UI components. This component allows for the configuration of each checkbox, including its disabled state, default checked state, value, and additional styles. It also supports the selection and deselection of checkboxes, maintaining the state of checked items.

## Props

- `id` (string): A unique identifier for the form group.
- `label` (optional, string): The label for the checkbox group.
- `checkboxConfig` (object): Configuration for the checkboxes, including:
  - `fields` (Array): An array of objects describing each checkbox. Each object can have `disabled`, `defaultChecked`, `value`, `children`, `subtext` and `style` properties.
- `checkedItems` (string[]): An array of strings representing the values of checked checkboxes.
- `setCheckedItems` (Function): A function to update the state of `checkedItems`.
- `inline` (optional, boolean): Whether the checkboxes should be displayed inline.
- `indeterminate` (optional, boolean): Sets the indeterminate state of the checkboxes (visual state where it's neither checked nor unchecked).

## Usage

Below is an example of how to use the `FormCheckboxes` component within a React component:

```tsx
import React, { useState } from 'react';
import FormCheckboxes from './FormCheckboxes';

const MyComponent = () => {
  const [checkedItems, setCheckedItems] = useState([]);

  const checkboxConfig = {
    fields: [
      { value: 'option1', children: 'Option 1' },
      { value: 'option2', children: 'Option 2', disabled: true },
      { value: 'option3', children: 'Option 3', defaultChecked: true },
      // more complicated example of what can be passed
      { value: 'option4', 
      children: (
        <span>
          <p>Please agree to the terms and conditions</p>
          <a href="https://example.com/tsandcs"> here</a>.
        </span>
      ), 
      style: (
        marginRight: "36px",
        border: '5px'
      )}
    ],
  };

  return (
    <FormCheckboxes
      id="myCheckboxGroup"
      label="Select Options"
      checkboxConfig={checkboxConfig}
      checkedItems={checkedItems}
      setCheckedItems={setCheckedItems}
      inline
    />
  );
};
```

## Implementation

The `FormCheckboxes` component starts by destructuring its props. It defines a `handleCheckboxChange` function that updates the `checkedItems` state based on whether a checkbox's value is already in the `checkedItems` array. The component renders a `Form.Group` from `rsuite`, optionally displaying a label. It then renders a `CheckboxGroup`, mapping over the `checkboxConfig.fields` array to render individual Checkbox components. Each checkbox is wrapped in a `div` that can be styled via the style property of the checkbox configuration. The `onChange` event of each checkbox is handled by the `handleCheckboxChange` function, allowing for the dynamic updating of the `checkedItems` state.
