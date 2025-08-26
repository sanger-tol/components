/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";

import { FormAllInOne, IFormConfig, Widgets } from "../tol-ui/src";

// Form layout config
const SESSION_FORM_CONFIG: IFormConfig = {
  fields: [
    {
      name: "event",
      type: "singleselect",
      label: "Event:",
      placeholder: "Choose an event",
      data: [
        "Event One",
        "Event Two"
      ]
    },
    {
      name: "sessionName",
      type: "text",
      label: "Session Name:",
      placeholder: "Session Name"
    },
    // TODO: Change the leaders field to a multiselect once that component is ready
    // (it wasn't when this code was written)
    {
      name: "leaders",
      type: "text",
      label: "Leaders:",
      placeholder: "Leaders"
    },
    {
      name: "startDatetime",
      type: "datetime",
      label: "Start Date and Time:"
    },
    {
      name: "duration",
      type: "text",
      label: "Duration:"
    },
    {
      name: "description",
      type: "markdown",
      label: "Description:"
    },
    {
      name: "prerequisites",
      type: "markdown",
      label: "Prerequisites:"
    },
    {
      name: "additionalInformation",
      type: "markdown",
      label: "Additional Information:"
    }
  ],
  buttonConfig: {
    buttons: [
      {
        text: "Save Session",
        type: "primary",
      }
    ],
    buttonStyle: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "10px"
    }
  }
};

// Form model config (used for validation)
const { DateType, StringType } = Schema.Types;
const FORM_MODEL = Schema.Model({
  event: StringType()
    .isRequired("This field is required"),
  sessionName: StringType()
    .isRequired("This field is required"),
  leaders: StringType()
    .isRequired("This field is required"),
  startDatetime: DateType()
    .isRequired("This field is required"),
  duration: StringType()
    .isRequired("This field is required"),
  description: StringType()
    .isRequired("This field is required"),
  prerequisites: StringType()
    .isRequired("This field is required"),
  additionalInformation: StringType()
});

// Type of object resulted from form submit
interface IFormData {
  event: string;
  sessionName: string;
  leaders: string;
  startDatetime: Date;
  duration: string;
  description: string;
  prerequisities: string;
  additionalInformation?: string;
}

export function Session() {
  const title = <h2>Session</h2>;

  const sessionForm = (
    <div className="session-form-container p-4">
      <FormAllInOne
        model={FORM_MODEL}
        formConfig={SESSION_FORM_CONFIG}
        onValidate={() => null}  // We don't need to do anything on validate, but it's required for onSubmit to be called
        onSubmit={(formData, isValid) => handleSubmit(formData as IFormData, isValid)}
      />
    </div>
  );

  function handleSubmit(formData: IFormData, isValid: boolean) {
    if (!isValid) {
      // We do not need to report this to the user, as FormAllInOne handles this for us
      return;
    }
    
    // TODO: Use submitted data
    console.log(formData);
    alert("Success!\n\nSee console log for submitted data");
  }

  const components = [
    {
      component: title,
      type: "full"
    },
    {
      component: sessionForm,
      type: "full"
    }
  ];

  return <Widgets components={components} />;
}
