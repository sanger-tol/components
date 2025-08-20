/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormAllInOne, Widgets, TsDataSource, env } from "../tol-ui/src";
import { Schema } from "rsuite";

const formConfig = {
  fields: [
    {
      name: "event",
      type: "autocomplete",
      label: "Test:",
      datasource: new TsDataSource({
        baseUrl: 'https://localhost:3011',
        apiPrefix: 'api/v1/local',
      }),
      objectType: "species",
      displayFields: ["genus", "scientific_name", "family"],
      searchBy: "name",
      placeholder: "Select the event where this session will take place...",
      block: true,
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
