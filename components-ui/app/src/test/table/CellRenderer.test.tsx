/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe, vitest } from "vitest";
import "@testing-library/jest-dom";

// Mock the getFieldByName function from utils.tsx
vitest.mock("../../tol-ui/src/table/utils", async(importOriginal) => {
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
  processFilterToBoolean,
} from "../../tol-ui/src";

describe("Testing processFilterToBoolean function", () => {
  test("in_list True", () => {
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
      { "and_": { "sts_scientific_name": { "eq": { "value": "Abax parallelepipedus" } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );

    const value2 = processFilterToBoolean(
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
    const value = processFilterToBoolean(
      { "and_": { "sts_scientific_name": { "eq": { "value": "Z" } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          sts_scientific_name: "Abax parallelepipedus",
        },
      }
    );

    const value2 = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
      { "and_": { "random_count": { "gt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );

    const value2 = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
      { "and_": { "random_count": { "gte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );

    const value2 = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
      { "and_": { "random_count": { "lt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );

    const value2 = processFilterToBoolean(
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
    const value = processFilterToBoolean(
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
    const value = processFilterToBoolean(
      { "and_": { "random_count": { "lte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    const value2 = processFilterToBoolean(
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
