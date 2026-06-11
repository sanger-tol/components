/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";

const { StringType } = Schema.Types;

export const BASE_PROFILE_FORM_MODEL = Schema.Model({
  name: StringType().isRequired("This field is required"),
  email: StringType()
    .isEmail("Please enter a valid email address")
    .isRequired("This field is required"),
});
