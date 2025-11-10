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
  /**
   * A function to perform tests on the getReadOnlyAndFilterText function (as all tests have the
   * same structure)
   * 
   * @param operatorType The type of filter operator used
   * @param negate Whether the operator is negated
   * @param expectedProse The prose expected to be returned by getReadOnlyAndFilterText. Where the
   * operator value is expected, use `VALUE`
   */
  function generalizedTest(
    operatorType: TFilterOperatorType,
    negate: boolean,
    expectedProse: string
  ) {
    test(
      `Filter operator ${operatorType} generates correct prose${negate ? " when negated" : ""}`,
      () => {
        const filterOperator: [TFilterOperatorType, IFilterOperatorOptions] = [
          operatorType,
          {
            value: "VALUE",
            negate,
          }
        ];

        const generatedProse = getReadOnlyAndFilterText(filterOperator);

        expect(generatedProse).toBe(expectedProse);
      }
    );
  }

  generalizedTest("eq", false, "must equal VALUE");
});
