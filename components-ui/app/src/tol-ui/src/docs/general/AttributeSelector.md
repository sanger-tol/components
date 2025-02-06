# AttributeSelector Component

## Description
The `AttributeSelector` component is a React component used to select attributes from a list of available options. It provides various customization options such as filtering by source, displaying tooltips, and handling multiple selections.

## Props
The `AttributeSelector` component accepts the following props:

- `additionalPopulatedFieldData` (any, optional): Additional data for populated fields.
- `allowedTypes` (list[string], optional): An array of allowed types (e.g., 'int', 'str'), these must be python types.
- `attribute` (list[string]required): An array of selected attributes (potentially populated from a database).
- `baseUrl` (string, optional): The base URL for fetching data.
- `disabledValues` (any, optional): Values that should be disabled in the selector.
- `displaySource` (boolean, optional): A boolean to display the source of attributes, e.g. "mlwh, sts", etc.
- `endpoint` (string, required): The endpoint to fetch attribute data from, e.g. "species", "run_data", etc.
- `maxSelections` (number, optional): The maximum number of selections allowed.
- `numPopulatedFields` (number, optional): The number of populated fields.
- `placeholder` (string, required): The placeholder text for the selector.
- `populatedFieldType` (string, optional): The type of populated field (e.g., "filter" or "column").
- `recommendedFilterAvailable` (boolean, optional): A boolean indicating if a recommended filter is available.
- `renderSearchBySource` (boolean, optional): A boolean to render search by source functionality.
- `setAttribute` (function, required): A function to set the selected attributes, returns the selected attributes.
- `sticky` (boolean, optional): A boolean to selected items show at the top of the list.
- `tooltipContent` (string, optional): The content for the tooltip, if an item is disabled.

## Usage
```tsx
import { AttributeSelector } from './path/to/AttributeSelector';

function MyComponent() {
    const [attributes, setAtributes] = useState<string[]>([]);
    const allAttributes = getMetadata();
    setAtributes(allAttributes);

  const handleSetAttribute = () => {

  return (
    <AttributeSelector
      attribute={attributes} // This is the initial state of the selected attributes
      endpoint="species"
      placeholder="Select an attribute"
      setAttribute={allAttributes}
      allowedTypes={['int', 'str']}
      maxSelections={5}
      displaySource={true}
      tooltipContent="Select an attribute from the list"
    />
  );
};
```

## Implementation
- The AttributeSelector component uses several hooks and utility functions to manage its state and behavior. 
- It initializes with a loading state and fetches metadata from the provided endpoint. 
- The component allows filtering attributes by source and supports multiple selections. 
- It also provides options to display tooltips and handle additional populated field data. 
- The component's state includes loading status, entity metadata, recommended filter status, available sources, and selected sources.