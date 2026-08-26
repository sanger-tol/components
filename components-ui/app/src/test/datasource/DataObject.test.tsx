/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import { mockDataObject } from "../mocks";

describe("getFieldByName method", () => {
  test("Ensures an attribute is fetched correctly", () => {
    expect(
      mockDataObject().getFieldByName("name")
    ).toBe("sampleName");
  });

  test("Ensures an attribute from a relationship is fetched correctly", () => {
    expect(
      mockDataObject().getFieldByName("specimen.name")
    ).toBe("specimenName");
  });

  test("Ensures an attribute from a doubly-nested relationship is fetched correctly", () => {
    expect(
      mockDataObject().getFieldByName("specimen.species.name")
    ).toBe("speciesName");
  });

  test("Ensures a field's value is undefined if it does not exist", () => {
    expect(
      mockDataObject().getFieldByName("doesNotExist.alsoDoesNotExist")
    ).toBeUndefined();
  });
});
