/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import { mockDataObject } from "../mocks";

describe("getFieldByName method", () => {
  test("Ensures an attribute is fetched correctly", () => {
    const obj = mockDataObject();
    expect(obj.getFieldByName("name")).toBe("sampleName");
  });

  test("Ensures a field's value is undefined if it does not exist", () => {
    const obj = mockDataObject();
    expect(obj.getFieldByName("doesNotExist.alsoDoesNotExist")).toBeUndefined();
  });
});
