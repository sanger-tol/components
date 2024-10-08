/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { Schema } from "rsuite";
import {
  RemoteAutoComplete,
  MultipleSelect,
  MultipleSelectFilters,
  RemoteMultipleSelectFilters,
  Dropzone,
  env,
  CountrySelect,
  SingleSelectCustomOption,
  FormAllInOne,
  Widgets,
  RSForm,
  Notification,
  Toaster,
} from "../tol-ui/src";
import {
  Appearance,
  Color,
  ButtonType,
} from "../tol-ui/src/forms/FormAllInOne";

const { StringType } = Schema.Types;

const REQUIRED_FIELD = "This field is required";

const signUpModel = Schema.Model({
  fullName: StringType().isRequired(REQUIRED_FIELD),
  email: StringType()
    .isEmail("Please enter a valid email address")
    .isRequired(REQUIRED_FIELD),
  password: StringType()
    .isRequired(REQUIRED_FIELD)
    .minLength(12, "Please ensure your password is at least 12 characters")
    .proxy(["confirmPassword"]),
  confirmPassword: StringType()
    .isRequired("Please confirm your password")
    .equalTo("password", "Passwords do not match"),
});

const profileModel = Schema.Model({
  name: StringType()
    .minLength(
      20,
      "If your name isn't at least 20 chars long, you're not cool."
    )
    .isRequired(REQUIRED_FIELD),
  email: StringType()
    .isEmail("Please enter a valid email address")
    .isRequired(REQUIRED_FIELD),
});

const testConfigProfileForm = {
  fields: [
    {
      name: "title",
      type: "singleSelectCustomOption",
      label: "Title:",
      block: true,
      customOptionPlaceholder: "Title",
      data: ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Other"],
    },
    {
      name: "name",
      label: "Full Name:",
      placeholder: "Full name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email:",
      placeholder: "Email address",
      type: "email",
      required: true,
    },
    {
      name: "orcid",
      label: "ORCID:",
      helpText: "This field is automatically populated with your ORCID",
      type: "text",
      readOnly: true,
      centered: true,
    },
    {
      name: "country",
      type: "countrySelect",
    },
    {
      type: "autocomplete",
      label: "Autocomplete:",
      name: "autocomplete test",
      data: [
        "Ant",
        "Bear",
        "Cat",
        "Dog",
        "Elephant",
        "Fish",
        "Giraffe",
        "Horse",
      ],
    },
    {
      name: "age",
      type: "singleSelect",
      label: "Age:",
      block: true,
      placeholder: "Please select your age...",
      data: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
    },
    {
      name: "job",
      type: "singleSelectCustomOption",
      label: "Job:",
      block: true,
      placeholder: "Please Select your job...",
      data: ["A", "B", "C", "D", "Other"],
    },
    {
      name: "interests",
      type: "multipleSelect",
      label: "Interests:",
      block: true,
      placeholder: "Please select your interests...",
      data: [
        "Science",
        "Technology",
        "Engineering",
        "Mathematics",
        "Art",
        "Music",
        "Sports",
      ],
    },
    {
      id: "termsAndConditionsCheckboxes",
      name: "termsAndConditions",
      label: "Please agree to the terms and conditions below:",
      type: "checkbox",
      defaultChecked: ["terms", "newsletter"],
      checkboxConfig: {
        fields: [
          {
            value: "terms",
            children: "I agree to the terms and conditions",
          },
          {
            value: "privacy policy",
            children: (
              <span>
                I agree to the privacy policy
                <a
                  href="#"
                  target="_blank"
                >
                  {" "}
                  here
                </a>
              </span>
            ),
          },
          {
            value: "newsletter",
            children: (
              <span>
                I would like to receive the newsletter
                <span style={{ color: "red" }}>*</span>
              </span>
            ),
            subtext: "We will share your details with our partners.",
          },
        ],
      },
    },
    {
      id: "inlineCheckboxes",
      name: "inline",
      label: "See The Items inline:",
      type: "checkbox",
      inline: true,
      defaultChecked: ["A", "B"],
      checkboxConfig: {
        fields: [
          {
            value: "C",
            children: "C",
          },
          {
            value: "B",
            children: "B",
          },
          {
            value: "A",
            children: "A",
          },
        ],
      },
    },
  ],
  buttonConfig: {
    buttons: [
      {
        name: "submit",
        text: "Submit",
        appearance: "primary" as Appearance,
        color: "cyan" as Color,
        type: "submit" as ButtonType,
        onClick: (formData: any) => {
          console.log("Form submitted with data: " + JSON.stringify(formData));
        },
      },
    ],
    buttonStyle: { display: "flex", justifyContent: "flex-end" },
  },
};

const signUpFormConfig = (hasUnsavedChanges: boolean) => ({
  fields: [
    {
      name: "fullName",
      label: "Name:",
      placeholder: "Please enter your full name...",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email:",
      placeholder: "Please enter your email address...",
      type: "email",
      required: true,
    },
    {
      name: "password",
      label: "Password:",
      placeholder: "Please enter your password...",
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password:",
      placeholder: "Please confirm your password...",
      type: "password",
      required: true,
    },
  ],
  buttonConfig: {
    buttons: [
      {
        id: "cancel-button",
        name: "cancel",
        text: "Cancel",
        appearance: "ghost" as Appearance,
        color: "red" as Color,
        onClick: () => {
          alert("Cancel button clicked");
        },
      },
      {
        name: "submit",
        text: "Submit",
        appearance: "ghost" as Appearance,
        disabled: !hasUnsavedChanges,
        color: "green" as Color,
        type: "submit" as ButtonType,
        onClick: () => {
          null;
        },
      },
    ],
    buttonStyle: { display: "flex", justifyContent: "space-between" },
  },
});

function Forms() {
  const [value, setValue] = useState([]);
  const [globalFilters, setGlobalFilters] = useState<object>({ in_list: {} });
  const [choices1, setChoices1] = useState<any[]>([]);
  const [choices2, setChoices2] = useState<any[]>([]);
  const [remoteFilters, setRemoteFilters] = useState<object>({ in_list: {} });
  const [country, setCountry] = useState<string>("");
  const [otherOptionValue, setOtherOptionValue] = useState<string>("");
  const [formUnsavedChanges, setFormUnsavedChanges] = useState<boolean>(false);

  const toaster = Toaster();

  // Used as data for the MultipleSelectFilters
  const filters = [
    {
      name: "test filter 1",
      choices: ["t1", "t2", "t3"],
      selected: choices1,
      setChoices: setChoices1,
    },
    {
      name: "test filter 2",
      choices: ["t1", "t2", "t3"],
      selected: choices2,
      setChoices: setChoices2,
    },
  ];

  const formComponentsTitle = <h2>Individual Form Components</h2>;

  const aioTitle = <h2>All In One Forms</h2>;

  const confirmValidationSuccess = () => {
    toaster.push(
      <Notification
        type="success"
        children={"Validation successful!"}
        header="Success"
        closable
      />,
      { placement: "topEnd", duration: 4000 }
    );
  };

  const formComponents = (
    <div>
      <h4>AutoComplete Input</h4>
      <RemoteAutoComplete
        endpoint="species"
        filter_by="name"
        display={["family", "genus"]}
      />
      <br />
      <h4>Multiple Select</h4>
      <MultipleSelect
        placeholder="Select"
        data={["test1", "test2", "test3"]}
        value={value}
        setValue={setValue}
      />
      <br />
      <h4>Multiple Select Filters</h4>
      <MultipleSelectFilters
        value={globalFilters}
        setValue={setGlobalFilters}
        filters={filters}
      />
      <br />
      <h4>Remote Multiple Select Filters</h4>
      <RemoteMultipleSelectFilters
        endpoint="run_data"
        fields={[
          "mlwh_platform_type",
          "mlwh_run_status",
          "mlwh_instrument_model",
        ]}
        renamedFields={{
          mlwh_platform_type: "test1",
          mlwh_run_status: "test2",
          mlwh_instrument_model: "test3",
        }}
        globalFilters={remoteFilters}
        setGlobalFilters={setRemoteFilters}
        baseUrl={env.TOL_DATA}
      />
      <br />
      <h4>Country Select</h4>
      <CountrySelect
        value={country}
        setValue={setCountry}
      />
      <br />
      <h4>Single Select With Custom Option</h4>
      <p>This must be inside a 'Form' component</p>
      <br />
      <RSForm
        fluid
        id={"singleSelectCustomOptionForm"}
      >
        <SingleSelectCustomOption
          id="testId1"
          data={["test1", "test2", "test3", "Other"]}
          value={otherOptionValue}
          setValue={setOtherOptionValue}
          label="Job Title"
          customOptionPlaceholder="Job Title..."
        />
      </RSForm>
      <br />
      <h4>Dropzone</h4>
      <Dropzone
        endpoint="this-is-fake"
        fileType=".csv"
        generateMessages={() => {
          return [];
        }}
      />
      <br />
    </div>
  );

  const allInOneForms = (
    <div>
      <h4>Profile Form</h4>
      <FormAllInOne
        formConfig={testConfigProfileForm}
        onValidate={(isValid) => isValid && confirmValidationSuccess()}
        fluid={true}
        initialData={{
          job: "Professor",
          country: "United Kingdom",
          title: "Professor",
        }}
        onUnsavedChanges={(hasChanges) => setFormUnsavedChanges(hasChanges)}
        model={profileModel}
      />
      <br />
      <h4>Sign Up Form</h4>
      <FormAllInOne
        onUnsavedChanges={(hasChanges) => setFormUnsavedChanges(hasChanges)}
        onValidate={(isValid) => isValid && confirmValidationSuccess()}
        formConfig={signUpFormConfig(formUnsavedChanges)}
        fluid={true}
        model={signUpModel}
      />
    </div>
  );

  const components = [
    {
      component: aioTitle,
      type: "title",
    },
    {
      component: allInOneForms,
      type: "full",
    },
    {
      component: formComponentsTitle,
      type: "full",
    },
    {
      component: formComponents,
      type: "full",
    },
  ];

  return (
    <div>
      <Widgets components={components} />
    </div>
  );
}

export default Forms;
