/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormAllInOne, Widgets } from "../tol-ui/src";
import { Schema } from "rsuite";

const formConfig = {
  fields: [
    {
      name: "event",
      type: "singleselect",
      label: "Event:",
      placeholder: "Select the event where this session will take place...",
      block: true,
      data: [
        // dummy data for demonstration
        "BGA25 Quarter 1",
        "BGA25 Quarter 2",
        "BGA25 Quarter 3",
        "BGA25 Quarter 4",
        "BGA26 Quarter 1",
      ],
    },
    {
      name: "sessionName",
      type: "text",
      label: "Session Name:",
      placeholder: "Enter session name here...",
    },
    {
      name: "datetime",
      type: "datetime",
      label: "Start Date and Time:",
      placeholder: "Enter start date and time here...",
      hideMinutes: (minute: number) => minute % 5 !== 0,
      helpText: "Please select a prospective date and time for this session.",
    },
    {
      name: "duration",
      type: "text",
      label: "Duration (in minutes):",
      placeholder: "Enter duration in minutes...",
      helpText:
        "Please enter the expected duration of this session in minutes.",
    },
    {
      name: "attendeeLimit",
      type: "text",
      label: "Attendee Limit:",
      placeholder: "Enter attendee limit here...",
      helpText:
        "Please enter the maximum number of attendees that can attend this session. Set to 0 for no limit.",
    },
    {
      name: "description",
      type: "markdown",
      label: "Description:",
      preview: "edit",
      removeCommands: ["preview", "fullscreen", "edit", "live"],
      height: 400,
    },
    {
      name: "prerequisites",
      type: "markdown",
      label: "Prerequisites:",
      helpText: "Please leave blank if there are no prerequisites.",
      preview: "edit",
      removeCommands: ["preview", "fullscreen", "edit", "live"],
      height: 400,
    },
    {
      name: "additionalInfo",
      type: "markdown",
      label: "Additional Information:",
      helpText: "Please leave blank if not applicable.",
      preview: "edit",
      removeCommands: ["preview", "fullscreen", "edit", "live"],
      height: 400,
    },
  ],
};

export function Sandbox() {
  const { StringType, NumberType } = Schema.Types;
  const model = Schema.Model({
    event: StringType().isRequired("Event is required."),
    sessionName: StringType().isRequired("Session Name is required."),
    duration: NumberType(),
    attendeeLimit: NumberType()
      .isRequired("Attendee Limit is required. 0 for unlimited.")
      .range(0, 500, "Attendee Limit must be between 0 and 500."),
    description: StringType().isRequired("Description is required."),
  });
  const components = [
    {
      component: (
        <>
          <h3 style={{ marginBottom: "0px" }}>Session Creation</h3>
          <p>
            Please fill in all required information. This session information will be sent to
            the admin team for approval.
          </p>
          <FormAllInOne
            formConfig={formConfig}
            model={model}
            initialData={{}}
            fluid
          />
        </>
      ),
      type: "full",
    },
  ];
  return (
    <>
      <Widgets components={components} />
    </>
  );
}
