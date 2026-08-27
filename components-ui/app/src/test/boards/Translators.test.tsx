/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TsDataSource } from "../../tol-ui/src";
import { relationshipConfigMockFlattened, relationshipConfigMockRelational } from "../mocks/datasource/relationships.mock";

const ds = new TsDataSource();

describe("findShortestRelationshipField for relational schemas", () => {
  beforeEach(() => {
    vi.spyOn(ds, "relationshipConfig").mockResolvedValue(relationshipConfigMockRelational);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("unchanged attributes", () => {
    test("same source and target type for - attribute", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "species");
      expect(result).toBe("name");
    });

    test("same source and target type - relationship attribute", async () => {
      const result = await ds.findShortestRelationshipField("specimens.id", "species", "species");
      expect(result).toBe("specimens.id");
    });
  })

  describe("attribute to relation", () => {
    test("one hop", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "specimen");
      expect(result).toBe("species.name");
    });

    test("multiple hops", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "sample");
      expect(result).toBe("specimen.species.name");
    });
  })

  describe("relation to attribute", () => {
    test("one hop", async () => {
      const result = await ds.findShortestRelationshipField("specimens.id", "species", "specimen");
      expect(result).toBe("id");
    });

    test("multiple hops", async () => {
      const result = await ds.findShortestRelationshipField("specimens.samples.id", "species", "sample");
      expect(result).toBe("id");
    });
  })
});

describe("findShortestRelationshipField for flattened schemas", () => {
  beforeEach(() => {
    vi.spyOn(ds, "relationshipConfig").mockResolvedValue(relationshipConfigMockFlattened);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("unchanged attributes", () => {
    test("same source and target type - attribute", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "species");
      expect(result).toBe("name");
    });

    test("same source and target type - relationship attribute", async () => {
      const result = await ds.findShortestRelationshipField("specimens.id", "species", "species");
      expect(result).toBe("specimens.id");
    });
  })

  describe("attribute to relation", () => {
    test("one hop", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "specimen");
      expect(result).toBe("species.name");
    });

    test("multiple hops", async () => {
      const result = await ds.findShortestRelationshipField("name", "species", "sample");
      expect(result).toBe("species.name");
    });
  })

  describe("relation to attribute", () => {
    test("one hop", async () => {
      const result = await ds.findShortestRelationshipField("specimens.id", "species", "specimen");
      expect(result).toBe("id");
    });

    test("multiple hops", async () => {
      const result = await ds.findShortestRelationshipField("samples.id", "species", "sample");
      expect(result).toBe("id");
    });
  })
});

describe("findShortestRelationshipField other universal cases", () => {
  beforeEach(() => {
    vi.spyOn(ds, "relationshipConfig").mockResolvedValue(relationshipConfigMockRelational);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("same source and target type", async () => {
    const result = await ds.findShortestRelationshipField("unknown.name", "species", "species");
    expect(result).toBeNull();
  });

  test("redundant path that resolves back to source type", async () => {
    // specimens → specimen, samples → sample, specimen → specimen, species → species (back to source)
    const result = await ds.findShortestRelationshipField(
      "specimens.samples.specimen.species.name",
      "species",
      "species"
    );
    expect(result).toBe("name");
  });

  test("returns null when target type does not exist in relationship config", async () => {
    const result = await ds.findShortestRelationshipField("name", "species", "not_a_real_type");
    expect(result).toBeNull();
  });

  test("returns null for malformed path with empty segment", async () => {
    const result = await ds.findShortestRelationshipField("specimens..id", "species", "sample");
    expect(result).toBeNull();
  });
});