# FormAllInOne

The `FormAllInOne` component is the main component to use when you want a form.

In `src/forms`, you'll find this component alongside all form components/form fields that you can use in a form.

## Defining a form config

When using a `FormAllInOne`, you do not need to work with the individual form components. Instead, these are made for you according to your form config.

A form config is an object of type `IFormConfig` (found in `src/interfaces/Forms.ts`). It is generally a good idea to define this object as a constant in your file, rather than in your component, as it does not need to change.

A form config is made up of two sections: `fields` and `buttonConfig`.

### `fields`

Here you'll define each field of your form. 

`fields` is an array of field objects. For each object, start by selecting the `type` of component you're defining. Your IDE, as you start typing a string, should show you all form component options.

Once you have chosen a component `type`, your IDE will be able to show you the possible options for this component type (such as its `name` or `label`). In addition, the interfaces for each component in `src/interfaces/Forms.ts` have comments describing the purpose of some of their properties.

Every form component has the `name` property. This is the name by which you'll refer to the 

### `buttonConfig`

PLACEHOLDER

## Extracting data from a submitted form

PLACEHOLDER

## Example

This example shows a form where users can create an event, by inputting the event's name, location, time and date.

```tsx
import {
  FormAllInOne, IFormConfig, Widgets
} from "../tol-ui/src";

// Define form config
const FORM_CONFIG: IFormConfig = {
  fields: [
    {
      name: "eventName",
      type: "text",
      label: "Name:",
      placeholder: "Event Name"
    },
    {
      name: "eventLocation",
      type: "singleselect",
      label: "Location:",
      placeholder: "Choose a location",
      data: [
        "Sports Centre",
        "Café",
        "Office"
      ]
    },
    {
      name: "eventDatetime",
      type: "datetime",
      label: "Date and Time:",
    }
  ],
  buttonConfig: {
    // TODO
  }
};

// React component to house our form
export function ExampleForm() {
  // Title component (separate to form body)
  const title = <h2>Create Event</h2>;

  // Form component
  const formBody = <FormAllInOne formConfig={FORM_CONFIG} />;

  // Define components of page
  // See `docs/general/Widgets.md` for documentation
  const components = [
    {
      component: title,
      type: "full"
    },
    {
      component: formBody,
      type: "full"
    }
  ];

  return <Widgets components={components} />
}
```

TODO: Add data retrieval to example
