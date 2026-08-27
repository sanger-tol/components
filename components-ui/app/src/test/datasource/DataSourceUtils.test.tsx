/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { describe, expect, test } from "vitest";
import { getFieldByName } from "../../tol-ui/src";
import type { TDataObjectOrNull } from "../../tol-ui/src";

describe("getFieldByName function", () => {
  test("Returns the value of a simple attribute", () => {
    const obj: TDataObjectOrNull = {
      id: "mock",
      objectType: "sample",
      name: "mock value",
    };
    expect(getFieldByName(obj, "name")).toBe("mock value");
  });

  test("Returns undefined for a non-existent attribute", () => {
    const obj: TDataObjectOrNull = {
      id: "mock",
      objectType: "sample",
    };
    expect(getFieldByName(obj, "non_existent")).toBeUndefined();
  });

  test("Returns undefined when object is null", () => {
    expect(getFieldByName(null, "name")).toBeUndefined();
  });

  test("Traverses a single relationship to return a related attribute", () => {
    const species: TDataObjectOrNull = {
      id: "mock_species",
      objectType: "species",
      name: "Homo sapiens",
    };
    const sample: TDataObjectOrNull = {
      id: "mock_sample",
      objectType: "sample",
      relationships: { species },
    };
    expect(getFieldByName(sample, "species.name")).toBe("Homo sapiens");
  });

  test("Traverses multiple relationship segments to return a deeply nested attribute", () => {
    const species: TDataObjectOrNull = {
      id: "mock_species",
      objectType: "species",
      name: "Homo sapiens",
    };
    const specimen: TDataObjectOrNull = {
      id: "mock_specimen",
      objectType: "specimen",
      relationships: { species },
    };
    const sample: TDataObjectOrNull = {
      id: "mock_sample",
      objectType: "sample",
      relationships: { specimen },
    };
    expect(getFieldByName(sample, "specimen.species.name")).toBe("Homo sapiens");
  });

  test("Returns undefined when a relationship segment does not exist", () => {
    const obj: TDataObjectOrNull = {
      id: "1",
      objectType: "sample",
      relationships: {},
    };
    expect(getFieldByName(obj, "non_existent.name")).toBeUndefined();
  });

  test("Returns an array of values when traversing a to-many relationship", () => {
    const sample1: TDataObjectOrNull = {
      id: "mock_sample_1",
      objectType: "sample",
      rack_position: "A1",
    };
    const sample2: TDataObjectOrNull = {
      id: "mock_sample_2",
      objectType: "sample",
      rack_position: "B2",
    };
    const specimen: TDataObjectOrNull = {
      id: "mock_specimen",
      objectType: "specimen",
      relationships: { samples: [sample1, sample2] },
    };
    expect(getFieldByName(specimen, "samples.rack_position")).toEqual(["A1", "B2"]);
  });

  test("Returns an array of undefined values for a non-existent field in a to-many relationship", () => {
    const sample1: TDataObjectOrNull = {
      id: "mock_sample_1",
      objectType: "sample",
    };
    const sample2: TDataObjectOrNull = {
      id: "mock_sample_2",
      objectType: "sample",
    };
    const specimen: TDataObjectOrNull = {
      id: "spec1",
      objectType: "specimen",
      relationships: { samples: [sample1, sample2] },
    };
    expect(getFieldByName(specimen, "samples.non_existent_field")).toEqual([undefined, undefined]);
  });

  test("Returns a provenance value for a field with provenance notation", () => {
    const obj: TDataObjectOrNull = {
      id: "1",
      objectType: "sample",
      provenance: {
        name: {
          sts: "mock value",
        },
      },
    };
    expect(getFieldByName(obj, "name[sts]")).toBe("mock value");
  });

  test("Returns undefined for a non-existent provenance source", () => {
    const obj: TDataObjectOrNull = {
      id: "1",
      objectType: "sample",
      provenance: {
        name: {
          sts: "mock value",
        },
      },
    };
    expect(getFieldByName(obj, "name[benchling]")).toBeUndefined();
  });

  test("Returns undefined for a provenance field on an object with no provenance data", () => {
    const obj: TDataObjectOrNull = {
      id: "1",
      objectType: "sample",
    };
    expect(getFieldByName(obj, "name[goat]")).toBeUndefined();
  });
});
