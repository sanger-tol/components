/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import { TsDataSource } from "../../tol-ui/src";
import { relationshipConfigMock } from "../mocks/datasource/relationships.mock";

const ds = new TsDataSource();

describe("findShortestRelationshipField", () => {
  describe("attribute fields", () => {
    test("same source and target type → returns field unchanged", async () => {
      const result = await ds.findShortestRelationshipField("name", "specimen", "specimen", relationshipConfigMock);
      expect(result).toBe("name");
    });

    test("direct one-relationship target → prepends relationship name", async () => {
      const result = await ds.findShortestRelationshipField("name", "specimen", "species", relationshipConfigMock);
      expect(result).toBe("species.name");
    });

    test("direct many-relationship target → prepends relationship name", async () => {
      const result = await ds.findShortestRelationshipField("name", "specimen", "sample", relationshipConfigMock);
      expect(result).toBe("samples.name");
    });

    test("two-hop target → prepends full shortest path", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "sample", relationshipConfigMock);
      expect(result).toBe("specimens.samples.name");
    });

    test("unreachable target type → returns field unchanged", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "unknown_type", relationshipConfigMock);
      expect(result).toBeNull();
    });
  });

  describe("relationship fields", () => {
    test("already shortest path → returns field unchanged", async () => {
      const result = await ds.findShortestRelationshipField("specimens.name", "species", "species", relationshipConfigMock);
      expect(result).toBe("specimens.name");
    });

    test("redundant path that resolves back to source type → returns bare attribute", async () => {
      // specimens → specimen, samples → sample, specimen → specimen, species → species (back to source)
      const result = await ds.findShortestRelationshipField(
        "specimens.samples.specimen.species.name",
        "species",
        "species",
        relationshipConfigMock
      );
      expect(result).toBe("name");
    });

    test("longer path that can be shortened → returns shortened field", async () => {
      // samples → sample, specimen → specimen, species → species; shortest from specimen to species is "species"
      const result = await ds.findShortestRelationshipField(
        "samples.specimen.species.name",
        "specimen",
        "specimen",
        relationshipConfigMock
      );
      expect(result).toBe("species.name");
    });

    test("unknown relationship segment → returns null", async () => {
      const result = await ds.findShortestRelationshipField("unknown.name", "species", "species", relationshipConfigMock);
      expect(result).toBeNull();
    });
  });
});

