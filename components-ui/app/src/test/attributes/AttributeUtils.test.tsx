/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import {
  getProseForAndFilters,
  generateFilterDescriptions,
  getProvenanceFieldName,
  isProvenanceField,
  isProvenanceFieldOfAttribute,
} from "../../tol-ui/src";
import type {
  IFilter,
  IFilterOperatorOptions,
  TFilterOperatorType
} from "../../tol-ui/src";

describe("getProseForAndFilters function", () => {
  /**
   * A function to perform tests on the getProseForAndFilters function (as most tests have the
   * same structure)
   * 
   * @param operatorType The type of filter operator used
   * @param negate Whether the operator is negated
   * @param expectedProse The prose expected to be returned by getProseForAndFilters. Where the
   * operator value is expected, use `VALUE`
   */
  function generalisedTest(
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

        const generatedProse = getProseForAndFilters(filterOperator);

        expect(generatedProse).toBe(expectedProse);
      }
    );
  }

  generalisedTest("exists", false, "must exist");
  generalisedTest("exists", true, "must not exist");
  generalisedTest("contains", false, "must have a value containing VALUE");
  generalisedTest("contains", true, "must not have a value containing VALUE");
  generalisedTest("eq", false, "must equal VALUE");
  generalisedTest("eq", true, "must not equal VALUE");
  generalisedTest("gt", false, "must be greater than VALUE");
  generalisedTest("gt", true, "must not be greater than VALUE");
  generalisedTest("gte", false, "must be greater than or equal to VALUE");
  generalisedTest("gte", true, "must not be greater than or equal to VALUE");
  generalisedTest("lt", false, "must be less than VALUE");
  generalisedTest("lt", true, "must not be less than VALUE");
  generalisedTest("lte", false, "must be less than or equal to VALUE");
  generalisedTest("lte", true, "must not be less than or equal to VALUE");

  test("Filter operator in_list generates correct prose", () => {
    const filterOperator: [TFilterOperatorType, IFilterOperatorOptions] = [
      "in_list",
      {
        value: ["DTOL", "PSYCHE", "BIOSCAN"],
        negate: false,
      }
    ];

    const generatedProse = getProseForAndFilters(filterOperator);

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

    const generatedProse = getProseForAndFilters(filterOperator);

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

    const generatedProse = getProseForAndFilters(filterOperator);

    expect(generatedProse).toBe("must be RELEASED");
  });
});

describe("getReadOnlyFiltersText function", () => {
  // This is the only test needed, as the transformation into prose is handled by
  // the getProseForAndFilters function, which is separately tested above
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
    expect(isProvenanceField("field[provenance]")).toBe(true);
  });

  test("A provenance field with multiple underscores", () => {
    expect(isProvenanceField("field_with_multiple_underscores[provenance]")).toBe(true);
  });

  test("A provenance field with a relationship", () => {
    expect(isProvenanceField("relation.field[provenance]")).toBe(true);
  });

  test("A complicated provenance field", () => {
    expect(isProvenanceField("abc_def_ghi.jkl_mno_pqr[provenance]")).toBe(true);
  });

  test("A non-provenance field", () => {
    expect(isProvenanceField("non_provenance_field")).toBe(false);
  });

  test("An invalid field", () => {
    expect(isProvenanceField("lsdkfjglsidfdsf")).toBe(false);
  });
});

describe("isProvenanceAttributeOfField function", () => {
  test("A simple provenance field", () => {
    expect(isProvenanceFieldOfAttribute("field[provenance]", "field")).toBe(true);
  });

  test("A provenance field with multiple underscores", () => {
    expect(
      isProvenanceFieldOfAttribute("field_with_multiple_underscores[provenance]", "field_with_multiple_underscores")
    ).toBe(true);
  });

  test("A provenance field with a relationship", () => {
    expect(
      isProvenanceFieldOfAttribute("relation.field[provenance]", "relation.field")
    ).toBe(true);
  });

  test("A complicated provenance field", () => {
    expect(
      isProvenanceFieldOfAttribute("abc_def_ghi.jkl_mno_pqr[provenance]", "abc_def_ghi.jkl_mno_pqr")
    ).toBe(true);
  });

  test("A non-provenance field", () => {
    expect(
      isProvenanceFieldOfAttribute("non_provenance_field", "non_provenance_field")
    ).toBe(false);
  });

  test("A provenance field of the incorrect base field", () => {
    expect(
      isProvenanceFieldOfAttribute("completely_different_field[provenance]", "field")
    ).toBe(false);
  });

  test("An invalid field", () => {
    expect(isProvenanceFieldOfAttribute("lsdkfjglsidfdsf", "field")).toBe(false);
  });
});
