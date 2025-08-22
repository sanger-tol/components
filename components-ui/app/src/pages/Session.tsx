/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormAllInOne, IFormConfig, Widgets } from "../tol-ui/src";

const SESSION_FORM_CONFIG: IFormConfig = {
  fields: [
    {
      name: "event",
      type: "singleselect",
      label: "Event:",
      placeholder: "Event",
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
    {
      name: "leaders",
      type: "text",
      label: "Leaders:",
      placeholder: "Leaders"
    },
    {
      name: "startDatetime",
      type: "datetime",
      label: "Start Date and Time"
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
  ]
}

export function Session() {
  const title = <h2>Session</h2>;

  const sessionForm = (
    <div className="session-form-container p-4">
      <FormAllInOne formConfig={SESSION_FORM_CONFIG} />
    </div>
  );

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
