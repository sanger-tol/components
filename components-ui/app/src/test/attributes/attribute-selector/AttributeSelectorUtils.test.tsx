/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Schema } from "rsuite";
import { describe, expect, test } from "vitest";

import { convertCustomFieldPythonTypeToFormField } from "../../../tol-ui/src";

describe("convertCustomFieldPythonTypeToFormField function", () => {
  test.each([
    [
      "str",
      { type: "text" },
      Schema.Types.StringType().isRequired(),
    ],
    [
      "bool",
      {
        type: "checkbox",
        checkboxConfig: {
          fields: [{}]
        }
      },
      Schema.Types.BooleanType().isRequired(),
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
      { type: "attributeselector", singleValue: true },
      Schema.Types.StringType().isRequired(),
    ],
    [
      "list[FieldName]",
      { type: "attributeselector" },
      Schema.Types.ArrayType().isRequired().of(Schema.Types.StringType()),
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

  test("Invalid pythonType", () => {
    expect(() => convertCustomFieldPythonTypeToFormField("not one of the options")).toThrow();
  });
});
