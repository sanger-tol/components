/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import "@testing-library/jest-dom";
import {
  CellFilterResult,
} from "../../tol-ui/src";


describe("Testing CellFilterResult function", () => {
  test("in_list True", () => {
    const value = CellFilterResult(
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
    const value = CellFilterResult(
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
    const value = CellFilterResult(
      { "and_": { "sts_scientific_name": { "contains": { "value": "Abax" } } } },
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
    const value = CellFilterResult(
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
    const value = CellFilterResult(
      { "and_": { "sts_scientific_name": { "eq": { "value": "Abax parallelepipedus" } } } },
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

  test("eq False", () => {
    const value = CellFilterResult(
      { "and_": { "sts_scientific_name": { "eq": { "value": "Z" } } } },
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

  test("gt True", () => {
    const value = CellFilterResult(
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
    const value = CellFilterResult(
      { "and_": { "random_count": { "gt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );
    expect(value).toBe(false);
  });

  test("gte True", () => {
    const value = CellFilterResult(
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
    const value = CellFilterResult(
      { "and_": { "random_count": { "gte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 1,
        },
      }
    );
    expect(value).toBe(false);
  });

  test("lt True", () => {
    const value = CellFilterResult(
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
    const value = CellFilterResult(
      { "and_": { "random_count": { "lt": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    expect(value).toBe(false);
  });

  test("lte True", () => {
    const value = CellFilterResult(
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
    const value = CellFilterResult(
      { "and_": { "random_count": { "lte": { "value": 5 } } } },
      {
        id: "abc",
        objectType: "species",
        attributes: {
          random_count: 10,
        },
      }
    );
    expect(value).toBe(false);
  });

});
