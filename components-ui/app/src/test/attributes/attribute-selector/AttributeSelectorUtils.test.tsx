/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";
import { describe, expect, test } from "vitest";

import { convertCustomFieldPythonTypeToFormField } from "../../../tol-ui/src";
import type { ITextField } from "../../../tol-ui/src";

function expectModelValidationToMatch<
  TActualModel extends { check(value: unknown): unknown },
  TExpectedModel extends { check(value: unknown): unknown },
>(
  actualModel: TActualModel,
  expectedModel: TExpectedModel,
  values: readonly unknown[],
) {
  for (const value of values) {
    expect(actualModel.check(value)).toEqual(expectedModel.check(value));
  }
}

describe("convertCustomFieldPythonTypeToFormField function", () => {
  test("pythonType of 'str'", () => {
    const [fieldConfig, fieldModel] = convertCustomFieldPythonTypeToFormField("str");

    expect(fieldConfig).toEqual({
      type: "text",
    } satisfies Omit<ITextField, "name">);

    const expectedModel = Schema.Types.StringType();
    const actualModel = fieldModel as typeof expectedModel;
    expectModelValidationToMatch(
      actualModel,
      expectedModel,
      [undefined, "", "ordinary string", 42]
    );
  });
});
