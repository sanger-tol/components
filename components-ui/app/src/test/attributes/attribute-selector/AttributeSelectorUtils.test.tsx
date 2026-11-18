/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";
import { describe, expect, test } from "vitest";

import { convertCustomFieldPythonTypeToFormField } from "../../../tol-ui/src";
import type { ISingleselectField, ITextField } from "../../../tol-ui/src";

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
  test.each([
    [
      "str",
      { type: "text" },
      Schema.Types.StringType().isRequired(),
    ],
    [
      "int",
      { type: "text" },
      Schema.Types.NumberType().isRequired().isInteger(),
    ],
    [
      "float",
      { type: "text" },
      Schema.Types.NumberType().isRequired(),
    ],
    [
      "Literal['first', 'second', 'third']",
      { type: "singleselect", data: ["first", "second", "third"] },
      Schema.Types.StringType().isRequired().isOneOf(["first", "second", "third"]),
    ],
    [
      "FieldName",
      { type: "attributeselector" },
      Schema.Types.StringType().isRequired(),
    ]
  ])("pythonType of %s", (pythonType, expectedFieldConfig, expectedFieldModel) => {
    // Run the function we're testing
    const [actualFieldConfig, actualFieldModel] = convertCustomFieldPythonTypeToFormField(
      pythonType
    );

    // Check the field config matches
    expect(actualFieldConfig).toEqual(expectedFieldConfig);

    // Check the actual field model against the expected field model
    // by trying validation against a bunch of values. Whether they pass or fail, both models
    // should yield the same outcomes
    for (const value of [undefined, "", "string", 42, 17.8, 80.0]) {
      expect(actualFieldModel.check(value as any)).toEqual(expectedFieldModel.check(value));
    }
  });
});
