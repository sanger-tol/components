# MultipleSelect Component

## Description

`MultipleSelect` is a React component that wraps around the `CheckPicker` from `rsuite` library, enhancing it with additional functionality such as a "Select all" checkbox option. It allows users to select multiple options from a dropdown list. The component is customizable with several props to control its behavior and appearance.

## Props

- `block` (boolean) (optional): If true, the picker will span the full width of its parent container.
- `data` (string[]): An array of strings representing the options available for selection.
- `value` (string[]): An array of strings representing the currently selected options.
- `setValue` (function): A function to update the state of the selected options.
- `placeholder` (string) (optional): A string to display when no option is selected.
- `disabled` (boolean) (optional): If true, the picker will be disabled.
- `loading` (boolean) (optional): If true, a loading indicator will be shown.
- `open` (boolean) (optional): Controls the visibility of the dropdown list.
- `onOpen` (function) (optional): A function that is called when the dropdown list is opened.
- `onEntering` (function) (optional): A function that is called when the dropdown is entering.
- `onClose` (function) (optional): A function that is called when the dropdown list is closed.
- `onClick` (function) (optional): A function that is called when the picker is clicked.
- `renderMenuItem` (function) (optional): A function to customize the rendering of each dropdown list item.
- `renderValue` (function) (optional): A function to customize the rendering of the selected items.
- `noSearch` (boolean) (optional): If true, the search functionality will be disabled.

## Usage

Here's an example of how to use the `MultipleSelect` component:

``` jsx
import React, { useState } from 'react';
import MultipleSelect from './MultipleSelect';

const App = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const options = ['Option 1', 'Option 2', 'Option 3'];

  return (
    <MultipleSelect
      data={options}
      value={selectedValues}
      setValue={setSelectedValues}
      placeholder="Select options"
    />
  );
};

export default App;
```

## Implementation

The `MultipleSelect` component starts by destructuring its props to use them within the component. It uses a helper function `isPropDefined` to determine if the `block` prop is defined, ensuring it defaults to false if not provided. The component maps the `data` prop to format it into an object array suitable for the `CheckPicker` component, which requires both `label` and `value` for each option.

A key feature of this component is the `selectAll` function, which renders a checkbox that allows users to select or deselect all options. This is achieved by checking if the length of the currently selected values matches the total number of options. The `handleCheckAll` function updates the selected values accordingly.

Finally, the component renders the `CheckPicker` with the formatted data and all the necessary props passed down or computed within the component. It also includes the `selectAll` checkbox as an extra footer element, enhancing the picker's functionality.
