/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";
import { describe, expect, test } from "vitest";

import { convertCustomFieldPythonTypeToFormField } from "../../../tol-ui/src";
import type { ITextField } from "../../../tol-ui/src";

function expectModelValidationToMatch(
  actualCheck: (value: unknown) => unknown,
  expectedCheck: (value: unknown) => unknown,
  values: readonly unknown[],
) {
  for (const value of values) {
    expect(actualCheck(value)).toEqual(expectedCheck(value));
  }
}

describe("convertCustomFieldPythonTypeToFormField function", () => {
  test("pythonType of 'str'", () => {
    const [fieldConfig, fieldModel] = convertCustomFieldPythonTypeToFormField("str");

    expect(fieldConfig).toEqual({
      type: "text",
    } satisfies Omit<ITextField, "name">);

    const expectedModel = Schema.Types.StringType();
    const actualStringModel = fieldModel as typeof expectedModel;
    expectModelValidationToMatch(
      value => actualStringModel.check(value),
      value => expectedModel.check(value),
      [undefined, "", "ordinary string", 42],
    );
  });
});
