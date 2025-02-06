# ColumnConfigDrawer Component

## Description

`ColumnConfigDrawer` is a React component that provides a user interface for configuring table columns. It allows users to reorder, remove, and save the configuration of table columns. It is opened via the `burger icon` button on the table and pulls out from the right side of the screen. It is used in the `Table` component. It also shows a modal if the user has unsaved data.

## Props

- `baseUrl` (string, optional): The base URL for API requests.
- `open` (boolean, `useState`): A flag indicating whether the drawer is open.
- `setOpen` (function, `useState`): A function to set the open state of the drawer.
- `title` (string): The title of the drawer.
- `fieldMeta` (FieldMeta): Metadata about the fields, including their order.
- `displaySource` (boolean, optional): A flag to display the source of the data, indicated by the source tag.
- `onConfigSave` (function): A callback function to save the column config and updates the table.
- `endpoint` (string): The data source type, i.e. "species", or "run_data".
- `sticky` (boolean, optional): A flag to make the selected items of the `AttributeSelector` sticky.

## Usage

```tsx
import React, { useState } from "react";
import ColumnConfigDrawer from "./ColumnConfigDrawer";
import { FieldMeta } from "../table/Field";

// Example of field meta layout
const fieldMeta: FieldMeta = {
  fields: {
    name: { label: "Name", type: "string" },
    age: { label: "Age", type: "number" },
    email: { label: "Email", type: "string" },
    address: { label: "Address", type: "string" },
    phone: { label: "Phone", type: "string" },
  },
  order: {
    active: ["name", "age", "email"],
    inactive: ["address", "phone"],
  },
};

// Example of ColumnConfigDrawer in a table
function Table() {
  const [open, setOpen] = useState(false);

  const handleConfigSave = (updatedFieldMeta: FieldMeta) => {
    console.log("Configuration saved:", updatedFieldMeta);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Column Config Drawer</button>
      <ColumnConfigDrawer
        baseUrl="https://api.example.com"
        open={open}
        setOpen={setOpen}
        title="Configure Columns"
        fieldMeta={fieldMeta}
        onConfigSave={handleConfigSave}
        endpoint="/save-config"
      />
    </div>
  );
}

export default Table;
```

## Implementation

- The `ColumnConfigDrawer` component manages the state of the table column configuration.
- These functions update the state and triggers animations using timeouts.
- The component also includes a callback function to save the configuration when changes are made, and will update the table.
- It uses React hooks to handle the state of attributes, the open state of the save modal and the indices of recently moved or deleted attributes.
- The component provides functions to move attributes up or down in the list and to remove attributes.
