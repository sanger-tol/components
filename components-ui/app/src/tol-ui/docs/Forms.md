SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT

# Forms

This is the documentation for the `FormAllInOne` component. If you are looking for individual form components (to be used outside of a form), check the props, as well as any JSDoc comments in their individual component files.

The `FormAllInOne` component is the main component to use when you want a form.

In `src/forms`, you'll find this component alongside all form components/form fields that you can use in a form.

A form requires a **config**, used to define its layout, and a **model**, used for its validation.

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

The button configuration describes the buttons at the bottom of your form (such as a submit or cancel button).

The `buttons` property is an array of type `PButton`, the props type for the `Button` component. Pass in the same data here as you would pass in as props to that component.

The `buttonStyle` property applies CSS properties to the container for the buttons. This object is the same as the one used for the `style` prop in React.

## Defining a form model

The form model is what the `rsuite` library uses to validate the form. Similarly to the form config, it is reccommended to define it outside of any React components, as it only needs to be defined once.

To define the model, call the constructor for `Model` on the `Schema` object from the `rsuite` library, passing in an object. This object will have a property for each of the fields in your form.

Each field is assigned a type. This is done through constructing a type class. To access these type classes, you will need to extract them from the `Schema.Types` object:
```ts
const { DateType, StringType } = Schema.Types;
```

To then add requirements for validation, call methods on this newly instantiated class, providing an error message for if this validation requirement fails. The `rsuite` documentation does not list all of them, so you can go to [this folder](https://github.com/rsuite/schema-typed/tree/master/src) in their github page to view the methods for each type class.

This results in a structure like this:
```ts
  field: TypeClass()
    .validationRequirementOne()
    .validationRequirementTwo(),
```

See the Example section for examples.

**NOTE:** These type classes are different to the `type` property used in the form config. These are the types that you would expect from the data returned from the submitted form. For example, a `singleselect` would be a string type.

## Extracting data from a submitted form

To access the data object returned when the form is submitted, you must assign a function to the `onSubmit` prop of `FormAllInOne`.

This function will be called with two arguments: an `object` containing the form data (where the name of each property is the name assigned to each field in your form config), and a `boolean` indicating whether the form is in a valid state. This is because `onSubmit` is called whenever the user attempts to submit the form, even if in an invalid state. Thus, check whether the form is valid before you use the data in the object.

**NOTE:** Make sure that you have assigned a function to the `onValidate` prop of `FormAllInOne`, even if you don't need it. This is because `onSubmit` is not called if `onValidate` is not set. If you do not need to handle this event (which is called after the form has been validated), simply pass it a function that does nothing (`() => null`).

## Example

This example shows a form where users can create an event, by inputting the event's name, location, time and date.

```tsx
import { Schema } from "rsuite";

import {
  FormAllInOne, IFormConfig, Widgets
} from "../tol-ui/src";

// Define form config for layout
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
    buttons: [
      {
        text: "Submit",
        type: "primary"
      }
    ],
    buttonStyle: {
      // One button on the right
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "10px"
    }
  }
};

// Define form model for validation
const { DateType, StringType } = Schema.Types;
const FORM_MODEL = Schema.Model({
  eventName: StringType()
    .isRequired("This field is required")
    .containsLetterOnly("An event name may only contain letters"),
  eventLocation: StringType()
    .isRequired("This field is required"),
  eventDatetime: DateType()
    .isRequired("This field is required"),
});

// OPTIONAL: Define interface for object returned from form submit
// The types here match the types in the form model
// Types that are not required are marked optional
interface IFormData {
  eventName: string;
  eventLocation: string;
  eventDatetime: Date;
}

// React component to house our form
export function ExampleForm() {
  // Title component (separate to form body)
  const title = <h2>Create Event</h2>;

  // Form component
  const formBody = (
    <FormAllInOne
      formConfig={FORM_CONFIG}
      model={FORM_MODEL}
      onValidate={() => null}
      onSubmit={(formData, isValid) => handleSubmit(formData as IFormData, isValid)}
    />
  );

  // Submit event handler
  function handleSubmit(formData: IFormData, isValid: boolean) {
    if (!isValid) {
      // We do not need to report this to the user, as FormAllInOne handles this for us
      return;
    }

    // You can now extract data from `formData` and do what you want with it
  }

  // Define components of page
  // See `docs/general/Widgets.md` for documentation for this
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
