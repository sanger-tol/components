/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMapping, IFormConfig } from "../..";

const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const PROFILE_FORM_FIELD_MAPPINGS: IFieldMapping[] = [
  {
    sourceField: "oidc_id",
    targetField: "email",
    condition: isEmail,
    readOnlyWhenMapped: true,
  },
];

export const BASE_PROFILE_FORM_CONFIG = (
  hasUnsavedChanges: boolean,
): IFormConfig => ({
  fields: [
    {
      name: "name",
<<<<<<< HEAD
      required: true,
=======
>>>>>>> dev
      type: "text",
      label: "Name:",
      placeholder: "Enter your name here...",
    },
    {
      name: "email",
<<<<<<< HEAD
      required: true,
=======
>>>>>>> dev
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
        ...(!hasUnsavedChanges && {
          disabledTooltip: "No unsaved changes detected.",
        }),
      },
    ],
    buttonStyle: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "20px",
    },
  },
});
