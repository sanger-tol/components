/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import "@testing-library/jest-dom";
import { expect, test, vitest, describe } from "vitest";
import {
  TDataObjectOrNull,
  TsDataSource,
  getChildObjectsByName,
  getFieldByName,
} from "../../tol-ui/src";

const speciesMockData = {
  data: {
    data: {
      id: "testSpeciesId",
      type: "species",
      attributes: { name: "test species" },
    },
  },
};
const speciesCursorMockData1 = {
  data: {
    data: [
      {
        id: "newTestSpeciesId",
        type: "species",
        attributes: { name: "test species" },
      },
    ],
    meta: {
      search_after: "newTestSpeciesIdX2",
    },
  },
};
const speciesCursorMockData2 = {
  data: {
    data: [
      {
        id: "newTestSpeciesIdX2",
        type: "species",
        attributes: { name: "test species" },
      },
    ],
    meta: {
      search_after: "newTestSpeciesIdX3",
    },
  },
};
const speciesCursorMockData3 = {
  data: {
    data: [],
    meta: {
      search_after: null,
    },
  },
};
const speciesUpsertMockData = {
  data: {
    data: [
      {
        id: "newTestSpeciesId",
        type: "species",
        attributes: { name: "test species" },
      },
    ],
  },
};
const sampleMockData = {
  data: {
    data: {
      id: "testSampleId",
      type: "sample",
      attributes: { name: "test sample" },
    },
  },
};

const specimenMockData = {
  data: {
    data: {
      id: "testSpecimenId",
      type: "specimen",
      relationships: {
        present_species: {
          data: {
            id: "present",
            type: "species",
          },
        },
        none_species: null,
      },
    },
  },
};

const toOneSpeciesMockData = {
  data: {
    data: {
      id: "lazy",
      type: "species",
      attributes: {
        lazy: true,
      },
    },
  },
};

const nestedRelationshipMockData = {
  data: {
    data: {
      id: "nestedRelationships1",
      type: "sample",
      attributes: {
        name: "sampleName",
      },
      relationships: {
        specimen: {
          data: {
            id: "nestedRelationships2",
            type: "specimen",
          },
        },
      },
    },
    included: [
      {
        id: "nestedRelationships2",
        type: "specimen",
        attributes: {
          name: "specimenName",
        },
        relationships: {
          species: {
            data: {
              id: "nestedRelationships3",
              type: "species",
            },
          },
        },
      },
      {
        id: "nestedRelationships3",
        type: "species",
        attributes: {
          name: "speciesName",
        },
      },
    ],
  },
};

const toManyRelationshipMockData = {
  data: {
    data: {
      id: "SAN1",
      type: "specimen",
      attributes: {
        name: "specimenName",
      },
      relationships: {
        samples: {
          data: [
            {
              id: "FF123",
              type: "sample",
            },
            {
              id: "FF124",
              type: "sample",
            },
          ],
        },
      },
    },
    included: [
      {
        id: "FF123",
        type: "sample",
        attributes: {
          rackPosition: "A3",
        },
      },
      {
        id: "FF124",
        type: "sample",
        attributes: {
          rackPosition: "A4",
        },
      },
    ],
  },
};

const attributeMetadataMockData = {
  specimen: {
    id: {
      authoritative: null,
      available_on_relationships: null,
      cardinality: 10,
      description: "This is a specimen id",
      display_name: null,
      python_type: "int",
    },
  },
  species: {
    id: {
      authoritative: null,
      available_on_relationships: null,
      cardinality: 10,
      description: "This is a species id",
      display_name: null,
      python_type: "int",
    },
  },
  sample: {
    id: {
      authoritative: null,
      available_on_relationships: null,
      cardinality: 10,
      description: "This is a sample id",
      display_name: null,
      python_type: "int",
    },
  },
  barcoding_run_data: {
    bioscan_c: {
      authoritative: null,
      available_on_relationships: null,
      cardinality: 5,
      description: null,
      display_name: null,
      python_type: "str",
    },
    bioscan_c_count: {
      authoritative: null,
      available_on_relationships: null,
      cardinality: 12,
      description: null,
      display_name: null,
      python_type: "int",
    },
    bioscan_checksum: {
      authoritative: null,
      available_on_relationships: null,
      cardinality: 81124,
      description: null,
      display_name: null,
      python_type: "str",
    },
  },
};

const relationshipConfigMockData = {
  species: {
    foreign_keys: {
      benchling_samples: "benchling_species.id",
      benchling_tissue_preps: "benchling_species.id",
      grit_curations: "grit_species.id",
      sts_samples: "sts_species.id",
    },
    many: {
      benchling_samples: "sample",
      benchling_tissue_preps: "tissue_prep",
      grit_curations: "curation",
      sts_samples: "sample",
      benchling_specimens: "specimen",
    },
  },
  specimen: {
    foreign_keys: {
      benchling_extractions: "benchling_specimen.id",
      benchling_samples: "benchling_specimen.id",
      benchling_sequencing_request: "benchling_specimen.id",
      mlwh_sequencing_request: "mlwh_specimen.id",
      sts_samples: "sts_specimen.id",
    },
    one: {
      present_species: "species",
      none_species: "species",
      lazy_species: "species",
      benchling_species: "species",
    },
    many: {
      benchling_extractions: "extraction",
      benchling_samples: "sample",
      benchling_sequencing_request: "sequencing_request",
      mlwh_sequencing_request: "sequencing_request",
      sts_samples: "sample",
    },
  },
  sample: {
    foreign_keys: {
      benchling_specimens: "benchling_sample.id",
    },
    one: {
      benchling_specimen: "specimen",
    },
  },
};

const mockClient = () => ({
  get(
    endpoint: string,
    { baseURL, params }: { baseURL: string; params?: any },
  ) {
    if (
      endpoint === "/_config/attribute_metadata" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve({ data: attributeMetadataMockData });
    } else if (
      endpoint === "/species/testSpeciesId" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve(speciesMockData);
    } else if (
      endpoint === "/noCacheTest/nestedRelationships1" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve(nestedRelationshipMockData);
    } else if (endpoint === "/specimen/SAN1" && baseURL === "/test-data-path") {
      return Promise.resolve(toManyRelationshipMockData);
    } else if (
      endpoint === "/specimen/testSpecimenId" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve(specimenMockData);
    } else if (
      endpoint === "/sample/testSampleId" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve(sampleMockData);
    } else if (
      endpoint === "/specimen:to-one/testSpecimenId/lazy_species" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve(toOneSpeciesMockData);
    } else if (
      endpoint === "/_config/relationships" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve({ data: relationshipConfigMockData });
    }
    return Promise.reject({ response: { status: 404 } });
  },
  delete(endpoint: string, { baseURL }: { baseURL: string; params?: any }) {
    if (
      endpoint === "/species/testSpeciesId" &&
      baseURL === "/test-data-path"
    ) {
      return Promise.resolve(null);
    }
    return Promise.reject({ response: { status: 404 } });
  },
  post(endpoint: string, payload, config: { baseURL: string, params?: any }) {
    if (
      endpoint === "/species:upsert" &&
      config.baseURL === "/test-data-path"
    ) {
      return Promise.resolve(speciesUpsertMockData);
    } else if (endpoint === "/species" && config.baseURL === "/test-data-path") {
      const pageSize = config?.params?.page_size || 10;
      const mockPageData = Array(pageSize).fill(speciesMockData.data.data);
      return Promise.resolve({ data: { data: mockPageData } });
    } else if (endpoint === "/species:cursor" && payload.search_after == null) {
      return Promise.resolve(speciesCursorMockData1);
    } else if (
      endpoint === "/species:cursor" &&
      payload.search_after == "newTestSpeciesIdX2"
    ) {
      return Promise.resolve(speciesCursorMockData2);
    } else if (
      endpoint === "/species:cursor" &&
      payload.search_after == "newTestSpeciesIdX3"
    ) {
      return Promise.resolve(speciesCursorMockData3);
    }
    return Promise.reject({ response: { status: 404 } });
  },
});

// need to adjust to account for the get config
const mockDataSource = new TsDataSource({
  apiDataPath: "/test-data-path",
  client: mockClient,
});

describe("generateEndpoint function", () => {
  test("Returns empty string with no objectType or suffix", () => {
    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
    });
    const endpoint = mockDataSource.generateEndpoint();
    expect(endpoint).toBe("");
  });

  test("Returns correct endpoint with target", () => {
    const mockDataSource = new TsDataSource({
      apiPath: "api",
    });
    const endpoint = mockDataSource.generateEndpoint("target");
    expect(endpoint).toBe("target");
  });

  test("Returns correct endpoint with apiPrefix, target, and objectId", () => {
    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
    });
    const endpoint = mockDataSource.generateEndpoint("target", "/123");
    expect(endpoint).toBe("target/123");
  });
});

describe("Testing basic getter functions", () => {
  test("getBaseUrl returns correct base URL", () => {
    const baseURL = mockDataSource.getBaseUrl();
    expect(baseURL).toBe("/test-data-path");
  });
});

describe("Testing getConfig function", () => {
  test("Retries getConfig function 3 times on error", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest
      .spyOn(mockClientInstance, "get")
      .mockImplementation(() => {
        throw new Error("simulated error");
      });

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    try {
      await mockDataSource.getConfig("errored-url");
    } catch (error) {
      // expected to throw after 3 retries
    }

    expect(clientGetSpy).toHaveBeenCalledTimes(3);
  });
});

describe("Testing attributeMetadata function", () => {
  test("Returns correct attribute metadata", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");
    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.attributeMetadata();
    const expectedData = attributeMetadataMockData;

    expect(dataObject).toEqual(expectedData);
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test("Caches attribute metadata and does not call client again", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    await mockDataSource.attributeMetadata();
    expect(clientGetSpy).toHaveBeenCalledTimes(0);
  });
});

describe("Testing relationshipConfig function", () => {
  test("Returns correct relationship config", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });
    const expectedData = relationshipConfigMockData;

    const dataObject = await mockDataSource.relationshipConfig();
    expect(dataObject).toEqual(expectedData);
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test("Caches relationship config and does not call client again", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    await mockDataSource.relationshipConfig();
    expect(clientGetSpy).toHaveBeenCalledTimes(0);
  });
});

/*
describe("Testing getEntityMeta function", () => {
  // Add tests for getEntityMeta if needed
});
*/

describe("Testing getOne function", () => {
  test("ID does not exist in promise", async () => {
    const dataObject = await mockDataSource.getOne({
      objectType: "species",
      id: "testSpeciesId",
    });

    const expectedData = speciesMockData.data.data;
    const rawData = {
      id: dataObject?.id,
      type: dataObject?.objectType,
      attributes: { name: dataObject?.name },
    };

    expect(JSON.stringify(rawData)).toBe(JSON.stringify(expectedData));
  });

  test("Multiple sequential calls with the same ID", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const dataObject = await mockDataSource.getOne({
      objectType: "species",
      id: "testSpeciesId",
    });

    expect(clientGetSpy).toHaveBeenCalledTimes(0);
    const expectedData = speciesMockData.data.data;
    const rawData = {
      id: dataObject?.id,
      type: dataObject?.objectType,
      attributes: { name: dataObject?.name },
    };
    expect(JSON.stringify(rawData)).toBe(JSON.stringify(expectedData));
  });

  test("Adding new object type", async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.getOne({
      objectType: "sample",
      id: "testSampleId",
    });

    const expectedData = sampleMockData.data.data;
    const rawData = {
      id: dataObject?.id,
      type: dataObject?.objectType,
      attributes: { name: dataObject?.name },
    };

    expect(JSON.stringify(rawData)).toBe(JSON.stringify(expectedData));
  });

  test("Throws error when endpoint is wrong", async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.getOne({
      objectType: "fail",
      id: "fail",
    });

    expect(dataObject).toBeNull();
  });
});

describe("Testing getByIds function", () => {
  test("Single ID request returns correct object", async () => {
    const dataObjects = await mockDataSource.getByIds({
      objectType: "species",
      ids: ["testSpeciesId"],
    });

    expect(dataObjects).toHaveLength(1);
    expect(dataObjects[0]?.name).toEqual("test species");
    expect(dataObjects[0]?.id).toEqual("testSpeciesId");
    expect(dataObjects[0]?.objectType).toEqual("species");
  });

  test("Multiple ID request returns correct object", async () => {
    const dataObjects = await mockDataSource.getByIds({
      objectType: "species",
      ids: ["testSpeciesId", "testSpeciesId"],
    });

    expect(dataObjects).toHaveLength(2);
    expect(dataObjects[0]?.name).toEqual("test species");
    expect(dataObjects[0]?.id).toEqual("testSpeciesId");
    expect(dataObjects[0]?.objectType).toEqual("species");

    expect(dataObjects[1]?.name).toEqual("test species");
    expect(dataObjects[1]?.id).toEqual("testSpeciesId");
    expect(dataObjects[1]?.objectType).toEqual("species");
  });

  test("Invalid ID request returns null or empty object", async () => {
    const dataObjects = await mockDataSource.getByIds({
      objectType: "species",
      ids: ["invalidId"],
    });

    expect(dataObjects).toHaveLength(1);
    expect(dataObjects[0]).toBeNull();
  });
});

describe("Testing getListPage function", () => {
  test("Calls get correct page size", async () => {
    const dataObjects1 = await mockDataSource.getListPage({
      objectType: "species",
      pageSize: 1,
    });

    const dataObjects2 = await mockDataSource.getListPage({
      objectType: "species",
      pageSize: 20,
    });

    expect(dataObjects1).toHaveLength(1);
    expect(dataObjects2).toHaveLength(20);
  });

  test("Calls get correct data", async () => {
    const dataObjects = await mockDataSource.getListPage({
      objectType: "species",
      pageSize: 1,
    });

    const dataObject = dataObjects![0];
    expect(dataObject).toBeDefined();
    expect(dataObject?.id).toEqual("testSpeciesId");
    expect(dataObject?.objectType).toEqual("species");
    expect(dataObject?.name).toEqual("test species");
  });

  test("Should return null on invalid objectType", async () => {
    const dataObjects = await mockDataSource.getListPage({
      objectType: "fail",
      pageSize: 1,
    });
    expect(dataObjects).toBeNull();
  });
});

describe("Testing getList function", () => {
  test("Calls get the async generator", async () => {
    const mockClientInstance = mockClient();
    const clientCursorPostSpy = vitest.spyOn(mockClientInstance, "post");
    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });
    const cursorDataObjects = await mockDataSource.getList({
      objectType: "species",
    });
    if (cursorDataObjects) {
      expect(cursorDataObjects).toBeDefined();
      expect(clientCursorPostSpy).toHaveBeenCalledTimes(3);
      expect(cursorDataObjects[0]!.id).toEqual("newTestSpeciesId");
      expect(cursorDataObjects[0]!.objectType).toEqual("species");
      expect(cursorDataObjects[0]!.name).toEqual("test species");
      expect(cursorDataObjects[1]!.id).toEqual("newTestSpeciesIdX2");
      expect(cursorDataObjects).toHaveLength(2);
    }
  });
});

describe("Testing getListByCursor function", () => {
  test("Calls get the async generator", async () => {
    const cursorDataObjects = await mockDataSource.getListByCursor({
      objectType: "species",
    });
    const iter1 = await cursorDataObjects.next();
    expect(iter1.value.id).toEqual("newTestSpeciesId");
    expect(iter1.value.objectType).toEqual("species");
    const iter2 = await cursorDataObjects.next();
    expect(iter2.value.id).toEqual("newTestSpeciesIdX2");
    expect(iter2.value.objectType).toEqual("species");
  });

  test("Should return null on invalid objectType", async () => {
    const cursorDataObjects = await mockDataSource.getListByCursor({
      objectType: "fail",
      pageSize: 1,
    });
    const iter = await cursorDataObjects.next();
    expect(iter.value).toBeNull();
  });
});

describe("Testing getCursorPage function", () => {
  test("Calls get correct page info", async () => {
    const cursorDataObjects = await mockDataSource.getCursorPage({
      objectType: "species",
    });

    const cursorDataObjectsLastItemCheck = await mockDataSource.getCursorPage({
      objectType: "species",
      searchAfter: ["newTestSpeciesIdX3"],
    });

    if (Array.isArray(cursorDataObjects)) {
      const [fetched, searchAfter] = cursorDataObjects;
      if (fetched && fetched[0] && searchAfter) {
        expect(fetched).toBeDefined();
        expect(fetched[0]?.id).toEqual("newTestSpeciesId");
        expect(fetched[0]?.objectType).toEqual("species");
        expect(fetched[0]?.name).toEqual("test species");
        expect(searchAfter).toBe("newTestSpeciesIdX2");
        expect(fetched).toHaveLength(1);
      }
    }
    if (Array.isArray(cursorDataObjectsLastItemCheck)) {
      const [fetched, searchAfter] = cursorDataObjectsLastItemCheck;
      if (fetched && fetched[0] && searchAfter) {
        expect(searchAfter).toBeNull;
      }
    }
  });

  test("Should return null on invalid objectType", async () => {
    const cursorDataObjects = await mockDataSource.getCursorPage({
      objectType: "fail",
      pageSize: 1,
    });
    expect(cursorDataObjects).toBeNull();
  });
});

describe("Testing delete method", () => {
  test("Delete correctly removes value", async () => {
    const mockClientInstance = mockClient();
    const clientDeleteSpy = vitest.spyOn(mockClientInstance, "delete");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.deleteByID({
      objectType: "species",
      id: "testSpeciesId",
    });

    expect(dataObject).toBeNull();
    expect(clientDeleteSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Testing upsert method", () => {
  test("Upserts value correctly", async () => {
    const mockClientInstance = mockClient();
    const clientPostSpy = vitest.spyOn(mockClientInstance, "post");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.upsert({
      objectType: "species",
      payload: [
        {
          type: "species",
          id: "newTestSpeciesId",
          attributes: {
            name: "test species",
          },
        },
      ],
    });
    expect(dataObject![0]!.id).toEqual("newTestSpeciesId");
    expect(clientPostSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Testing relationships getting", () => {
  test("Testing fetching 1 and 2 jump attributes", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const sample = await mockDataSource.getOne({
      objectType: "noCacheTest",
      id: "nestedRelationships1",
    });

    expect(clientGetSpy).toHaveBeenCalledTimes(1);
    expect(sample).not.toBeNull();
    expect(sample?.relationships?.specimen?.["id"]).toEqual(
      "nestedRelationships2",
    );
    expect(
      sample?.relationships?.specimen?.["relationships"]?.species?.["name"],
    ).toEqual("speciesName");
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test("Ensure missing attribute is undefined", async () => {
    const mockClientInstance = mockClient();
    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const sample = await mockDataSource.getOne({
      objectType: "noCacheTest",
      id: "nestedRelationships1",
    });

    expect(sample).not.toBeNull();
    expect(sample?.relationships?.random_attribute).toBeUndefined();
  });
});

describe("Testing to many relationships getting", () => {
  test("Testing fetching to many relationship attributes", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "SAN1",
      requestedFields: ["name", "samples.rackPosition"],
    });

    expect(clientGetSpy).toHaveBeenCalledTimes(1);
    expect(specimen).not.toBeNull();
    const samples = specimen?.relationships?.samples;
    expect(Array.isArray(samples)).toBe(true);
    expect(samples?.length).toEqual(2);
    expect(samples?.[0].id).toEqual("FF123");
    expect(samples?.[1].id).toEqual("FF124");
    expect(samples?.[0].rackPosition).toEqual("A3");
    expect(samples?.[1].rackPosition).toEqual("A4");
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test("Ensure missing attribute is undefined", async () => {
    const mockClientInstance = mockClient();
    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "SAN1",
      requestedFields: ["name", "samples.rackPosition"],
    });

    expect(specimen).not.toBeNull();
    const samples = specimen?.relationships?.samples;
    expect(samples?.[0].missingAttribute).toBeUndefined();
  });
});

describe("Testing fetchRelationships getting", () => {
  test("Do not fetch explicit null", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "testSpecimenId",
    });
    expect(specimen).not.toBeNull();
    expect(clientGetSpy).toHaveBeenCalledTimes(1);

    expect(await specimen?.fetchRelationships?.none_species).toBeNull();
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test("Do not fetch provided relation", async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "testSpecimenId",
    });
    expect(specimen).not.toBeNull();

    const presentSpecies1 = await specimen?.fetchRelationships?.present_species;
    expect(presentSpecies1?.["id"]).toEqual("present");
    expect(presentSpecies1?.["objectType"]).toEqual("species");
  });

  test("Lazily fetch missing relation", async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      apiDataPath: "/test-data-path",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "testSpecimenId",
    });
    expect(specimen).not.toBeNull();

    const lazySpecies1 = await specimen?.fetchRelationships?.lazy_species;

    expect(lazySpecies1?.["id"]).toEqual("lazy");
    expect(lazySpecies1?.["objectType"]).toEqual("species");
    expect(lazySpecies1?.["lazy"]).toEqual(true);
  });
});

describe("Testing temp getFieldByName function", async () => {
  const mockClientInstance = mockClient();
  const mockDataSource = new TsDataSource({
    apiDataPath: "/test-data-path",
    client: () => mockClientInstance,
  });

  const testDataObject = await mockDataSource.getOne({
    objectType: "noCacheTest",
    id: "nestedRelationships1",
  });

  test("Returns correct value from an attribute or related attribute", () => {
    expect(testDataObject).toBeDefined();
    expect(getFieldByName(testDataObject, "name")).toBe("sampleName");
    expect(getFieldByName(testDataObject, "specimen.name")).toBe(
      "specimenName",
    );
    expect(getFieldByName(testDataObject, "specimen.species.name")).toBe(
      "speciesName",
    );
  });

  test("Ensures a field's value is undefined if it does not exist", () => {
    expect(
      getFieldByName(testDataObject, "doesNotExist.alsoDoesNotExist"),
    ).toBeUndefined();
    // check if null obj
  });

  test("Returns a list of values when traversing a to-many relationship", async () => {
    const toManyDataObject = await mockDataSource.getOne({
      objectType: "specimen",
      id: "SAN1",
    });

    expect(toManyDataObject).toBeDefined();
    const tubosPositions = getFieldByName(
      toManyDataObject,
      "samples.rackPosition",
    );
    expect(Array.isArray(tubosPositions)).toBe(true);
    expect(tubosPositions).toEqual(["A3", "A4"]);
  });

  test("Returns undefined for non-existent field in to-many relationship", async () => {
    const toManyDataObject = await mockDataSource.getOne({
      objectType: "specimen",
      id: "SAN1",
    });

    expect(toManyDataObject).toBeDefined();
    const nonExistentValues = getFieldByName(
      toManyDataObject,
      "samples.nonExistentField",
    );
    expect(Array.isArray(nonExistentValues)).toBe(true);
    expect(nonExistentValues).toEqual([undefined, undefined]);
  });
});

describe("Testing temp getChildObjectsByName function", () => {
  test("Returns the current object wrapped in an array when field has no dot (including null)", () => {
    const obj: TDataObjectOrNull = {
      id: "1",
      objectType: "test",
      relationships: {},
    };
    expect(getChildObjectsByName(obj, "name")).toEqual([obj]);

    const nil: TDataObjectOrNull = null;
    expect(getChildObjectsByName(nil, "name")).toEqual([null]);
  });

  test("Traverses a single relationship segment when field contains a dot, returning the related object", () => {
    const child: TDataObjectOrNull = {
      id: "c1",
      objectType: "child",
      relationships: {},
    };
    const root: TDataObjectOrNull = {
      id: "r1",
      objectType: "root",
      relationships: {
        child,
      },
    };

    // last segment is treated as a field; traversal stops at `child`
    expect(getChildObjectsByName(root, "child.name")).toEqual([child]);
  });

  test("Traverses multiple relationship segments, returning the object at the end of the relationship path", () => {
    const address: TDataObjectOrNull = {
      id: "addr1",
      objectType: "address",
      relationships: {},
    };
    const author: TDataObjectOrNull = {
      id: "a1",
      objectType: "author",
      relationships: { address },
    };
    const root: TDataObjectOrNull = {
      id: "r1",
      objectType: "root",
      relationships: { author },
    };

    // author -> address, last segment ("city") is treated as a field
    expect(getChildObjectsByName(root, "author.address.city")).toEqual([
      address,
    ]);
  });

  test("Maps over array relationships and flattens results into a single list", () => {
    const pet1: TDataObjectOrNull = {
      id: "p1",
      objectType: "pet",
      relationships: {},
    };
    const pet2: TDataObjectOrNull = {
      id: "p2",
      objectType: "pet",
      relationships: {},
    };

    const child1: TDataObjectOrNull = {
      id: "c1",
      objectType: "child",
      relationships: { pet: pet1 },
    };
    const child2: TDataObjectOrNull = {
      id: "c2",
      objectType: "child",
      relationships: { pet: pet2 },
    };

    const root: TDataObjectOrNull = {
      id: "r1",
      objectType: "root",
      relationships: {
        children: [child1, child2],
      },
    };

    expect(getChildObjectsByName(root, "children.pet.name")).toEqual([
      pet1,
      pet2,
    ]);
  });

  test("Ignores duplicates of objects", () => {
    const pet1: TDataObjectOrNull = {
      id: "p1",
      objectType: "pet",
      relationships: {},
    };

    const child1: TDataObjectOrNull = {
      id: "c1",
      objectType: "child",
      relationships: { pet: pet1 },
    };
    const child2: TDataObjectOrNull = {
      id: "c2",
      objectType: "child",
      relationships: { pet: pet1 },
    };

    const root: TDataObjectOrNull = {
      id: "r1",
      objectType: "root",
      relationships: {
        children: [child1, child2],
      },
    };

    expect(getChildObjectsByName(root, "children.pet.name")).toEqual([pet1]);
  });

  test("Falls back to returning [null] when a relationship segment is missing", () => {
    const root: TDataObjectOrNull = {
      id: "r1",
      objectType: "root",
      relationships: {},
    };

    // missing relationship => fallthrough to return [null]
    expect(getChildObjectsByName(root, "missing.id")).toEqual([null]);
  });

  test("Falls back to returning [null] when a relationship segment is null", () => {
    const root: TDataObjectOrNull = {
      id: "r1",
      objectType: "root",
      relationships: { child: null },
    };

    // null relationship => fallthrough to return [null]
    expect(getChildObjectsByName(root, "child.name")).toEqual([null]);
  });
});

describe("Testing getFieldRelationshipValue", () => {
  test("Returns correct value from a to many relationship field", async () => {
    const mockAttValue = await mockDataSource.getAttributeDescriptor({
      objectType: "species",
      field: "benchling_specimens.benchling_samples.id",
    });
    expect(mockAttValue).toBeDefined();
    expect(mockAttValue?.cardinality).toBe(10);
    expect(mockAttValue?.python_type).toBe("int");
    expect(mockAttValue?.description).toBe("This is a sample id");
  });

  test("Returns correct value from a to one relationship field", async () => {
    const mockAttValue = await mockDataSource.getAttributeDescriptor({
      objectType: "sample",
      field: "benchling_specimen.benchling_species.id",
    });
    expect(mockAttValue).toBeDefined();
    expect(mockAttValue?.cardinality).toBe(10);
    expect(mockAttValue?.python_type).toBe("int");
    expect(mockAttValue?.description).toBe("This is a species id");
  });

  test("Returns undefined for non-existent relationship field", async () => {
    const mockAttValue = await mockDataSource.getAttributeDescriptor({
      objectType: "sample",
      field: "benchling_specimen.non_existent_field",
    });
    expect(mockAttValue).toBeUndefined();
  });
});
