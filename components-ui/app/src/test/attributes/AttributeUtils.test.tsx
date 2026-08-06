/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import {
  getReadOnlyAndFilterText,
  generateFilterDescriptions,
  IFilter,
  IFilterOperatorOptions,
  TFilterOperatorType,
  getProvenanceFieldName,
  isProvenanceAttribute
} from "../../tol-ui/src";

describe("getReadOnlyAndFilterText function", () => {
  /**
   * A function to perform tests on the getReadOnlyAndFilterText function (as most tests have the
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

  generalizedTest("exists", false, "must exist");
  generalizedTest("exists", true, "must not exist");
  generalizedTest("contains", false, "must have a value containing VALUE");
  generalizedTest("contains", true, "must not have a value containing VALUE");
  generalizedTest("eq", false, "must equal VALUE");
  generalizedTest("eq", true, "must not equal VALUE");
  generalizedTest("gt", false, "must be greater than VALUE");
  generalizedTest("gt", true, "must not be greater than VALUE");
  generalizedTest("gte", false, "must be greater than or equal to VALUE");
  generalizedTest("gte", true, "must not be greater than or equal to VALUE");
  generalizedTest("lt", false, "must be less than VALUE");
  generalizedTest("lt", true, "must not be less than VALUE");
  generalizedTest("lte", false, "must be less than or equal to VALUE");
  generalizedTest("lte", true, "must not be less than or equal to VALUE");

  test("Filter operator in_list generates correct prose", () => {
    const filterOperator: [TFilterOperatorType, IFilterOperatorOptions] = [
      "in_list",
      {
        value: ["DTOL", "PSYCHE", "BIOSCAN"],
        negate: false,
      }
    ];

    const generatedProse = getReadOnlyAndFilterText(filterOperator);

    expect(generatedProse).toBe("must be one of DTOL, PSYCHE or BIOSCAN");
  });

  test("Filter operator in_list generates correct prose when negated", () => {
    const filterOperator: [TFilterOperatorType, IFilterOperatorOptions] = [
      "in_list",
      {
        value: ["DTOL", "PSYCHE", "BIOSCAN"],
        negate: true,
      }
    ];

    const generatedProse = getReadOnlyAndFilterText(filterOperator);

    expect(generatedProse).toBe("must not be one of DTOL, PSYCHE or BIOSCAN");
  });

  test("Filter operator in_list generates correct prose when there is only one item", () => {
    const filterOperator: [TFilterOperatorType, IFilterOperatorOptions] = [
      "in_list",
      {
        value: ["RELEASED"],
        negate: false,
      }
    ];

    const generatedProse = getReadOnlyAndFilterText(filterOperator);

    expect(generatedProse).toBe("must be RELEASED");
  });
});

describe("getReadOnlyFiltersText function", () => {
  // This is the only test needed, as the transformation into prose is handled by
  // the getReadOnlyAndFilterText function, which is separately tested above
  test("Function returns an object in the correct format", () => {
    const filter: IFilter = {
      and_: {
        "tolqclegacy_assembly_stage": {
          in_list: {
            value: ["RELEASED", "DRAFT"],
            negate: true,
          }
        },
        "tolqc_scientific_name": {
          contains: {
            value: "Abax",
            negate: false,
          },
          eq: {
            value: "Abax parallelepipedus",
            negate: true,
          }
        }
      }
    };

    const expectedObject = {
      "tolqclegacy_assembly_stage": ["must not be one of RELEASED or DRAFT"],
      "tolqc_scientific_name": [
        "must have a value containing Abax",
        "must not equal Abax parallelepipedus"
      ],
    };
    const generatedObject = generateFilterDescriptions(filter);

    expect(generatedObject).toEqual(expectedObject);
  });
});

describe("getProvenanceFieldName function", () => {
  test("A simple field", () => {
    expect(getProvenanceFieldName("field", "provenance")).toBe("field[provenance]");
  });

  test("A field with multiple underscores", () => {
    expect(
      getProvenanceFieldName("field_with_multiple_underscores", "provenance")
    ).toBe(
      "field_with_multiple_underscores[provenance]"
    );
  });

  test("A field with a relationship", () => {
    expect(getProvenanceFieldName("relation.field", "provenance")).toBe("relation.field[provenance]");
  });

  test("A complicated field", () => {
    expect(
      getProvenanceFieldName("abc_def_ghi.jkl_mno_pqr", "provenance")
    ).toBe(
      "abc_def_ghi.jkl_mno_pqr[provenance]"
    );
  });
});

describe("isProvenanceAttribute function", () => {
  test("A simple provenance field", () => {
    expect(isProvenanceAttribute("field[provenance]")).toBe(true);
  });

  test("A provenance field with multiple underscores", () => {
    expect(isProvenanceAttribute("field_with_multiple_underscores[provenance]")).toBe(true);
  });

  test("A provenance field with a relationship", () => {
    expect(isProvenanceAttribute("relation.field[provenance]")).toBe(true);
  });

  test("A complicated provenance field", () => {
    expect(isProvenanceAttribute("abc_def_ghi.jkl_mno_pqr[provenance]")).toBe(true);
  });

  test("A non-provenance field", () => {
    expect(isProvenanceAttribute("non_provenance_field")).toBe(false);
  });

  test("An invalid field", () => {
    expect(isProvenanceAttribute("lsdkfjglsidfdsf")).toBe(false);
  });
});
