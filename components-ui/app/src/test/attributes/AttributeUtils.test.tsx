/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import {
  getReadOnlyAndFilterText,
  IFilterOperatorOptions,
  TFilterOperatorType
} from "../../tol-ui/src";

describe("getReadOnlyAndFilterText function", () => {
  test("Direct value operator generates correct prose", () => {
    const operator: [TFilterOperatorType, IFilterOperatorOptions] = [
      "eq",
      {
        value: "Abrostola",
        negate: false,
      }
    ];

    const generatedProse = getReadOnlyAndFilterText(operator);

    expect(generatedProse).toBe("must equal Abrostola");
  })
});
