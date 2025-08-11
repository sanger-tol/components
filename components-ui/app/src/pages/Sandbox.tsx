/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FormAllInOne, Widgets } from "../tol-ui/src";

const formConfig = {
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title:",
      placeholder: "Enter title here...",
    },
    {
      name: "Markdown Field",
      type: "markdown",
      label: "Event Description:",
      placeholder: "Type your markdown here...",
      preview: "edit",
      removeCommands: ["preview", "fullscreen", "edit"],
      height: 400
    },
    {
      name: "Another Markdown Field",
      type: "markdown",
      label: "Another Event Description:",
      placeholder: "Type your markdown here...",
      preview: "edit",
      removeCommands: ["preview", "fullscreen", "edit"],
      height: 400
    }
  ]
};

export function Sandbox() {

  const components = [
    {
      component: <FormAllInOne formConfig={formConfig} fluid />,
      type: "full"
    }
  ]
  return (
    <>
      <Widgets components={components} />
    </>
  );
}
