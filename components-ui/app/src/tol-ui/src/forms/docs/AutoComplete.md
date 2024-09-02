# AutoComplete Component

## Description

The `AutoComplete` component is a wrapper around the `AutoComplete` component from the `rsuite` library. It is designed to provide an easy-to-use interface for implementing autocomplete functionality in your application. The component displays a list of suggestions based on the user's input.

## Props

- `data` (string[]): An array of strings that will be used as the data source for the autocomplete suggestions.
- `value` (string): The current value of the autocomplete input. This is a controlled component, so the value is required to display the current input.
- `onChange` (function): An optional callback function that is called when the value of the autocomplete input changes. This function receives the new value as its argument.

## Usage

Here's an example of how to use the `AutoComplete` component:

``` jsx
import AutoComplete from './AutoComplete';

function MyComponent() {
  const [value, setValue] = useState('');
  const data = ['Option 1', 'Option 2', 'Option 3'];

  return (
    <AutoComplete
      data={data}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  );
}
```

In this example, `MyComponent` maintains the state of the autocomplete's input value and passes it to the `AutoComplete` component. It also defines a list of suggestions and passes them to the component. When the user selects a suggestion or types in the input, the `onChange` handler updates the state with the new value.

## Implementation

The `AutoComplete` component takes the `data`, `value`, and `onChange` props and passes them directly to the `RSAutoComplete` component from the rsuite library. It wraps the `RSAutoComplete` component in a `div` element, making it easy to style or further customize if needed.
