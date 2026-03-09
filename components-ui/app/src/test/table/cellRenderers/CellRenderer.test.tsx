/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe, vitest } from "vitest";
import "@testing-library/jest-dom";

// Mock the getFieldByName function from utils.tsx
vitest.mock("../../../tol-ui/src/table/utils", async(importOriginal) => {
  const actual = await importOriginal(); 
  return {
    ...actual,
    getFieldByName: vitest.fn((dataObject, fieldName) => {
      return dataObject?.attributes[fieldName];
    }),
  };
});

// Have to import after the mock to ensure the mock is applied
import {
  processConditionToBoolean,
  processTagsToValues,
  resolveObjectKeys,
} from "../../../tol-ui/src";
import {
  getSpeciesDataObjectMock,
  getDataPointObjectMock,
} from "../..";


describe("Testing processConditionToBoolean function", () => {
  test("in_list True", () => {
    const value = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "in_list": { "value": ["Abax parallelepipedus"] } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );
    expect(value).toBe(true);
  });

  test("in_list False", () => {
    const value = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "in_list": { "value": ["Abax parallelepipedus"] } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Not in List",
        },
      }
    );
    expect(value).toBe(false);
  });

  test("contains True", () => {
    const value = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "contains": { "value": "A" } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );
    expect(value).toBe(true);
  });

  test("contains False", () => {
    const value = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "contains": { "value": "Z" } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );
    expect(value).toBe(false);
  });

  test("eq True", () => {
    const value = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "eq": { "value": "Abax parallelepipedus" } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );

    const value2 = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "eq": { "value": 2 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: 2,
        },
      }
    );

    expect(value).toBe(true);
    expect(value2).toBe(true);
  });

  test("eq False", () => {
    const value = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "eq": { "value": "Z" } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );

    const value2 = processConditionToBoolean(
      { "and_": { "sts_scientific_name": { "eq": { "value": 2 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );

    expect(value).toBe(false);
    expect(value2).toBe(false);
  });

  test("gt True", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "gt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    expect(value).toBe(true);
  });

  test("gt False", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "gt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );

    const value2 = processConditionToBoolean(
      { "and_": { "random_count": { "gt": { "value": 'test' } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );
    expect(value).toBe(false);
    expect(value2).toBe(false);
  });

  test("gte True", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "gte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 5,
        },
      }
    );
    expect(value).toBe(true);
  });

  test("gte False", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "gte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );

    const value2 = processConditionToBoolean(
      { "and_": { "random_count": { "gte": { "value": 'test' } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 5,
        },
      }
    );
    expect(value).toBe(false);
    expect(value2).toBe(false);
  });

  test("lt True", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "lt": { "value": 10 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 5,
        },
      }
    );
    expect(value).toBe(true);
  });

  test("lt False", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "lt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );

    const value2 = processConditionToBoolean(
      { "and_": { "random_count": { "lt": { "value": 'test' } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    expect(value).toBe(false);
    expect(value2).toBe(false);
  });

  test("lte True", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "lte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 5,
        },
      }
    );
    expect(value).toBe(true);
  });

  test("lte False", () => {
    const value = processConditionToBoolean(
      { "and_": { "random_count": { "lte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    const value2 = processConditionToBoolean(
      { "and_": { "random_count": { "lte": { "value": 'test' } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    expect(value).toBe(false);
    expect(value2).toBe(false);
  });

});

describe("Testing resolveObjectKeys function", () => {
  test("resolves 1 level deep", () => {
    expect(resolveObjectKeys(getDataPointObjectMock(), "field[mobile]")).toBe(123456789);
  });

  test("resolves 2 levels deep", () => {
    expect(resolveObjectKeys(getDataPointObjectMock(), "field[address][city]")).toBe("London");
  });

  test("resolves 3 levels deep", () => {
    expect(resolveObjectKeys(getDataPointObjectMock(), "field[address][location][coordinates][latitude]")).toBe(51.5074);
  });

  test("returns empty string for missing key", () => {
    expect(resolveObjectKeys(getDataPointObjectMock(), "field[address][postcode]")).toBe("");
  });

  test("returns empty string for missing intermediate key", () => {
    expect(resolveObjectKeys(getDataPointObjectMock(), "field[missing][city]")).toBe("");
  });

  test("returns object as-is when no bracket keys in path", () => {
    expect(resolveObjectKeys(getDataPointObjectMock(), "field")).toEqual(getDataPointObjectMock());
  });
});

describe("Testing processTagsToValues function", () => {
  test("resolves a simple field key from dataObject", () => {
    const result = processTagsToValues("scientific_name", "other_field", "unused", getSpeciesDataObjectMock());
    expect(result).toBe("Abax parallelepipedus");
  });

  test("returns empty string when field is not found in dataObject", () => {
    const result = processTagsToValues("missing_field", "other_field", "unused", getSpeciesDataObjectMock());
    expect(result).toBe("");
  });

  test("returns the current value when spread operator is used and field matches", () => {
    const result = processTagsToValues("...scientific_name", "scientific_name", "current_value", getSpeciesDataObjectMock());
    expect(result).toBe("current_value");
  });

  test("returns the current array value when spread operator is used and field matches", () => {
    const arrayValue = ["val1", "val2"];
    const result = processTagsToValues("...my_field", "my_field", arrayValue, getSpeciesDataObjectMock());
    expect(result).toEqual(["val1", "val2"]);
  });

  test("looks up from dataObject when spread operator is used but field does not match", () => {
    const result = processTagsToValues("...scientific_name", "other_field", "unused", getSpeciesDataObjectMock());
    expect(result).toBe("Abax parallelepipedus");
  });

  test("resolves nested object keys from dataObject", () => {
    const result = processTagsToValues("location[city]", "other_field", "unused", getSpeciesDataObjectMock());
    expect(result).toBe("London");
  });

  test("resolves deeply nested object keys from dataObject", () => {
    const result = processTagsToValues("location[coordinates][lat]", "other_field", "unused", getSpeciesDataObjectMock());
    expect(result).toBe(51.5);
  });

  test("resolves nested object keys with spread operator using current value", () => {
    const objValue = { city: "London", postcode: "SW1" };
    const result = processTagsToValues("...my_field[city]", "my_field", objValue, getSpeciesDataObjectMock());
    expect(result).toBe("London");
  });

  test("returns empty string for missing nested key", () => {
    const result = processTagsToValues("location[postcode]", "other_field", "unused", getSpeciesDataObjectMock());
    expect(result).toBe("");
  });

  test("returns empty string when dataObject is null", () => {
    const result = processTagsToValues("scientific_name", "other_field", "unused", null);
    expect(result).toBe("");
  });
});
