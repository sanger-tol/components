/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFormConfig } from "../..";

export const BASE_PROFILE_FORM_CONFIG = (
  hasUnsavedChanges: boolean,
): IFormConfig => ({
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name:",
      placeholder: "Enter your name here...",
    },
    {
      name: "email",
      type: "email",
      label: "Email Address:",
      placeholder: "Enter your email here...",
    },
    {
      name: "workplace",
      type: "text",
      label: "Workplace/Institution:",
      placeholder: "Enter your workplace/Institution here...",
    },
  ],
  buttonConfig: {
    buttons: [
      {
        text: "Save Profile",
        type: "success",
        disabled: !hasUnsavedChanges,
      },
    ],
    buttonStyle: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "20px",
    },
  },
});
