/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import "@testing-library/jest-dom";
import { expect, test, vitest, describe } from "vitest";
import { TsDataSource, getFieldByName } from "../../tol-ui/src";


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
            attributes: {
              name: "specimenName",
            },
            relationships: {
              species: {
                data: {
                  id: "nestedRelationships3",
                  type: "species",
                  attributes: {
                    name: "speciesName",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const attributeMetadataMockData = {
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
    },
    many: {
      benchling_extractions: "extraction",
      benchling_samples: "sample",
      benchling_sequencing_request: "sequencing_request",
      mlwh_sequencing_request: "sequencing_request",
      sts_samples: "sample",
    },
  },
};

const mockClient = () => ({
  get(
    endpoint: string,
    { url, params }: { url: string; params?: any }
  ) {
    if (endpoint === "/api/v2/_config/attribute_metadata" && url === "test.website.com") {
      return Promise.resolve({ data: attributeMetadataMockData });
    } else if (endpoint === "/api/v2/species/testSpeciesId" && url === "test.website.com") {
      return Promise.resolve(speciesMockData);
    } else if (endpoint === "/api/v2/noCacheTest/nestedRelationships1" && url === "test.website.com") {
      return Promise.resolve(nestedRelationshipMockData);
    } else if (endpoint === "/api/v2/specimen/testSpecimenId" && url === "test.website.com") {
      return Promise.resolve(specimenMockData);
    } else if (endpoint === "/api/v2/sample/testSampleId" && url === "test.website.com") {
      return Promise.resolve(sampleMockData);
    } else if (endpoint === "/api/v2/species" && url === "test.website.com") {
      const pageSize = params?.page_size || 10;
      const mockPageData = Array(pageSize).fill(speciesMockData.data.data);
      return Promise.resolve({ data: { data: mockPageData } });
    } else if (
      endpoint === "/api/v2/specimen:to-one/testSpecimenId/lazy_species" &&
      url === "test.website.com"
    ) {
      return Promise.resolve(toOneSpeciesMockData);
    } else if (endpoint === "/api/v2/_config/relationships" && url === "test.website.com") {
      return Promise.resolve({ data: relationshipConfigMockData });
    }
    return Promise.reject({ response: { status: 404 } });
  },
  delete(endpoint: string, { url }: { url: string; params?: any }) {
    if (endpoint === "/api/v2/species/testSpeciesId" && url === "test.website.com") {
      return Promise.resolve(null);
    }
    return Promise.reject({ response: { status: 404 } });
  },
  post(endpoint: string, payload, config: { url: string }) {
    if (endpoint === "/api/v2/species:upsert" && config.url === "test.website.com") {
      return Promise.resolve(speciesUpsertMockData);
    } else if (endpoint === "/api/v2/species:cursor" && payload.search_after == null) {
      return Promise.resolve(speciesCursorMockData1);
    } else if (
      endpoint === "/api/v2/species:cursor" &&
      payload.search_after == "newTestSpeciesIdX2"
    ) {
      return Promise.resolve(speciesCursorMockData2);
    } else if (
      endpoint === "/api/v2/species:cursor" &&
      payload.search_after == "newTestSpeciesIdX3"
    ) {
      return Promise.resolve(speciesCursorMockData3);
    }
    return Promise.reject({ response: { status: 404 } });
  },
});

// need to adjust to account for the get config
const mockDataSource = new TsDataSource({
  url: "test.website.com",
  apiPath: "api/v2",
  apiDataPath: "data",
  dataspace: "test-dataspace",
  client: mockClient,
});

describe("generateEndpoint function", () => {
  test("Returns empty string when no apiPrefix, target, or objectId", () => {
    const mockDataSource = new TsDataSource({});
    const endpoint = mockDataSource.generateEndpoint();
    expect(endpoint).toBe("");
  });

  test("Returns correct endpoint with apiPath only", () => {
    const mockDataSource = new TsDataSource({
      apiPath: "api",
    });
    const endpoint = mockDataSource.generateEndpoint();
    expect(endpoint).toBe("/api");
  });

  test("Returns correct endpoint with apiPath and target", () => {
    const mockDataSource = new TsDataSource({
      apiPath: "api",
    });
    const endpoint = mockDataSource.generateEndpoint("target");
    expect(endpoint).toBe("/api/target");
  });

  test("Returns correct endpoint with apiPath, target, and objectId", () => {
    const mockDataSource = new TsDataSource({
      apiPath: "api",
    });
    const endpoint = mockDataSource.generateEndpoint("target", "/123");
    expect(endpoint).toBe("/api/target/123");
  });

  test("Returns correct endpoint with target and objectId but no apiPath", () => {
    const mockDataSource = new TsDataSource({});
    const endpoint = mockDataSource.generateEndpoint("target", "/123");
    expect(endpoint).toBe("/target/123");
  });
});

describe("Testing getters", () => {
  test("getUrl returns correct URL", () => {
    const url = mockDataSource.getUrl();
    expect(url).toBe("test.website.com");
  });

  test("getUrl returns undefined when no URL is provided", () => {
    const mockDataSource = new TsDataSource({
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
    });
    const url = mockDataSource.getUrl();
    expect(url).toBe(undefined);
  });

  test("getApiPath returns correct API path", () => {
    const apiPath = mockDataSource.getApiPath();
    expect(apiPath).toBe("api/v2");
  });

  test("getApiPath returns undefined when no apiPath is provided", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiDataPath: "data",
      dataspace: "test-dataspace",
    });
    const apiPath = mockDataSource.getApiPath();
    expect(apiPath).toBe(undefined);
  });

  test("getApiDataPath returns correct API Data Path", () => {
    const apiDataPath = mockDataSource.getApiDataPath();
    expect(apiDataPath).toBe("data");
  });

  test("getApiDataPath returns undefined when no API Data Path is provided", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      dataspace: "test-dataspace",
    });
    const apiDataPath = mockDataSource.getApiDataPath();
    expect(apiDataPath).toBe(undefined);
  });

  test("getDataspace returns correct dataspace", () => {
    const dataspace = mockDataSource.getDataspace();
    expect(dataspace).toBe("test-dataspace");
  });

  test("getDataspace returns undefined when no dataspace is provided", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
    });
    const dataspace = mockDataSource.getDataspace();
    expect(dataspace).toBe(undefined);
  });

  test("getSourceKey returns correct source key", () => {
    const sourceKey = mockDataSource.getSourceKey();
    expect(sourceKey).toBe("test.website.com/api/v2/data/test-dataspace");
  });

  test("getSourceKey returns 'default' when ALL of url, apiPath, apiDataPath and dataspace are undefined", () => {
    const mockDataSource = new TsDataSource();
    const sourceKey = mockDataSource.getSourceKey();
    expect(sourceKey).toBe("default");
  });

  test("getSourceKey returns source key containing `undefined`s if some of the above fields are undefined", () => {
    const mockDataSource = new TsDataSource({
      apiPath: "api/v1",
      dataspace: "test-dataspace"
    });
    const sourceKey = mockDataSource.getSourceKey();
    expect(sourceKey).toBe("undefined/api/v1/undefined/test-dataspace");
  });

  test("getBaseUrl returns correct base URL", () => {
    const baseUrl = mockDataSource.getBaseUrl();
    expect(baseUrl).toBe("test.website.com/api/v2/data/test-dataspace");
  });
});

describe("Testing setters", () => {
  test("setUrl correctly sets URL", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: mockClient,
    });
    mockDataSource.setUrl("portal.tol.sanger.ac.uk");
    const url = mockDataSource.getUrl();
    expect(url).toBe("portal.tol.sanger.ac.uk");
  });

  test("setApiPath correctly sets apiPath", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v1",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: mockClient,
    });
    mockDataSource.setApiPath("api/v2");
    const apiPath = mockDataSource.getApiPath();
    expect(apiPath).toBe("api/v2");
  });

  test("setApiDataPath correctly sets apiDataPath", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: mockClient,
    });
    mockDataSource.setApiDataPath("different-data");
    const apiDataPath = mockDataSource.getApiDataPath();
    expect(apiDataPath).toBe("different-data");
  });

  test("setDataspace correctly sets dataspace", () => {
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: mockClient,
    });
    mockDataSource.setDataspace("treeofsex");
    const dataspace = mockDataSource.getDataspace();
    expect(dataspace).toBe("treeofsex");
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: () => mockClientInstance,
    });
    const cursorDataObjects = await mockDataSource.getList({
      objectType: "species",
    });
    if (cursorDataObjects) {
      expect(cursorDataObjects).toBeDefined();
      expect(clientCursorPostSpy).toHaveBeenCalledTimes(3);
      expect(cursorDataObjects[0].id).toEqual("newTestSpeciesId");
      expect(cursorDataObjects[0].objectType).toEqual("species");
      expect(cursorDataObjects[0].name).toEqual("test species");
      expect(cursorDataObjects[1].id).toEqual("newTestSpeciesIdX2");
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.deleteByID({
      objectType: "species",
      id: "testSpeciesId",
    });

    expect(dataObject).toBeUndefined();
    expect(clientDeleteSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Testing upsert method", () => {
  test("Upserts value correctly", async () => {
    const mockClientInstance = mockClient();
    const clientPostSpy = vitest.spyOn(mockClientInstance, "post");

    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
    expect(dataObject![0].id).toEqual("newTestSpeciesId");
    expect(clientPostSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Testing relationships getting", () => {
  test("Testing fetching 1 and 2 jump attributes", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: () => mockClientInstance,
    });

    const sample = await mockDataSource.getOne({
      objectType: "noCacheTest",
      id: "nestedRelationships1",
    });

    expect(clientGetSpy).toHaveBeenCalledTimes(1);
    expect(sample).not.toBeNull();
    expect(sample?.relationships?.specimen.id!).toEqual("nestedRelationships2");
    expect(sample?.relationships?.specimen.relationships?.species.name).toEqual(
      "speciesName"
    );
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test("Ensure missing attribute is undefined", async () => {
    const mockClientInstance = mockClient();
    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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

describe("Testing fetchRelationships getting", () => {
  test("Do not fetch explicit null", async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, "get");

    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
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
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "testSpecimenId",
    });
    expect(specimen).not.toBeNull();

    const presentSpecies1 = await specimen?.fetchRelationships?.present_species;
    expect(presentSpecies1?.id).toEqual("present");
    expect(presentSpecies1?.objectType).toEqual("species");
  });

  test("Lazily fetch missing relation", async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      url: "test.website.com",
      apiPath: "api/v2",
      apiDataPath: "data",
      dataspace: "test-dataspace",
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({
      objectType: "specimen",
      id: "testSpecimenId",
    });
    expect(specimen).not.toBeNull();

    const lazySpecies1 = await specimen?.fetchRelationships?.lazy_species;

    expect(lazySpecies1?.id).toEqual("lazy");
    expect(lazySpecies1?.objectType).toEqual("species");
    expect(lazySpecies1?.lazy).toEqual(true);
  });
});

describe("Testing temp getFieldByName function", async () => {
  const mockClientInstance = mockClient();
  const mockDataSource = new TsDataSource({
    url: "test.website.com",
    apiPath: "api/v2",
    apiDataPath: "data",
    dataspace: "test-dataspace",
    client: () => mockClientInstance,
  });

  const testDataObject = await mockDataSource.getOne({
    objectType: "noCacheTest",
    id: "nestedRelationships1",
  })

  test("Returns correct value from an attribute or related attribute", () => {
    expect(testDataObject).toBeDefined();
    expect(getFieldByName(testDataObject, "name")).toBe("sampleName");
    expect(getFieldByName(testDataObject, "specimen.name")).toBe("specimenName");
    expect(getFieldByName(testDataObject, "specimen.species.name")).toBe("speciesName");
  });

  test("Ensures a field's value is undefined if it does not exist", () => {
    expect(getFieldByName(testDataObject, "doesNotExist.alsoDoesNotExist")).toBeUndefined();
    // check if null obj
  });
})