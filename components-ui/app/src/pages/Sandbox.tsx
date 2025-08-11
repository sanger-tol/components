/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormAllInOne, Widgets } from "../tol-ui/src";

const formConfig = {
  fields: [
    {
      name: "sessionName",
      type: "text",
      label: "Session Name:",
      placeholder: "Enter session name here...",
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
  const components = [
    {
      component: <FormAllInOne formConfig={formConfig} fluid />,
      type: "full",
    },
  ];
  return (
    <>
      <Widgets components={components} />
    </>
  );
}
