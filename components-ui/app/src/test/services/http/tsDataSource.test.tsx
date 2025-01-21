// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT


import {expect, test, vitest, describe} from 'vitest';
import TsDataSource from '../../../tol-ui/src/services/http/TsDataSource';
import '@testing-library/jest-dom';


const speciesMockData = { data: { data: { id: 'testSpeciesId', type: 'species', attributes: { name: 'test species' } } } };
const speciesUpsertMockData = { data: { data: [{ id: 'newTestSpeciesId', type: 'species', attributes: { name: 'test species' } }] } };
const sampleMockData = { data: { data: { id: 'testSampleId', type: 'sample', attributes: { name: 'test sample' } } } };

const specimenMockData = {
  data: {
    data: {
      id: 'testSpecimenId',
      type: 'specimen',
      relationships: {
        present_species: {
          data: {
            id: 'present',
            type: 'species'
          }
        },
        none_species: null
      }
    }
  }
};

const toOneSpeciesMockData = {
  data: {
    data: {
      id: 'lazy',
      type: 'species',
      attributes: {
        'lazy': true
      }
    }
  }
};

const attributeMetadataMockData = {
  "barcoding_run_data": {
      "bioscan_c": {
          "authoritative": null,
          "available_on_relationships": null,
          "cardinality": 5,
          "description": null,
          "display_name": null,
          "python_type": "str"
      },
      "bioscan_c_count": {
          "authoritative": null,
          "available_on_relationships": null,
          "cardinality": 12,
          "description": null,
          "display_name": null,
          "python_type": "int"
      },
      "bioscan_checksum": {
          "authoritative": null,
          "available_on_relationships": null,
          "cardinality": 81124,
          "description": null,
          "display_name": null,
          "python_type": "str"
      }
  }
};

const relationshipConfigMockData = {
  "species": {
      "foreign_keys": {
          "benchling_samples": "benchling_species.id",
          "benchling_tissue_preps": "benchling_species.id",
          "grit_curations": "grit_species.id",
          "sts_samples": "sts_species.id"
      },
      "many": {
          "benchling_samples": "sample",
          "benchling_tissue_preps": "tissue_prep",
          "grit_curations": "curation",
          "sts_samples": "sample"
      }
  },
  "specimen": {
      "foreign_keys": {
          "benchling_extractions": "benchling_specimen.id",
          "benchling_samples": "benchling_specimen.id",
          "benchling_sequencing_request": "benchling_specimen.id",
          "mlwh_sequencing_request": "mlwh_specimen.id",
          "sts_samples": "sts_specimen.id"
      },
      "one": {
          "present_species": "species",
          "none_species": "species",
          "lazy_species": "species",
      },
      "many": {
          "benchling_extractions": "extraction",
          "benchling_samples": "sample",
          "benchling_sequencing_request": "sequencing_request",
          "mlwh_sequencing_request": "sequencing_request",
          "sts_samples": "sample"
      }
  },
};

const mockClient = () => ({
  get(endpoint: string, { baseURL, params }: { baseURL: string, params?: any }) {
    if (endpoint === '/_config/attribute_metadata' && baseURL === 'test') {
      return Promise.resolve({ data: attributeMetadataMockData });
    } else if (endpoint === '/species/testSpeciesId' && baseURL === 'test') {
      return Promise.resolve(speciesMockData);
    } else if (endpoint === '/specimen/testSpecimenId' && baseURL === 'test') {
      return Promise.resolve(specimenMockData);
    } else if (endpoint === '/sample/testSampleId' && baseURL === 'test') {
      return Promise.resolve(sampleMockData);
    } else if (endpoint === '/species' && baseURL === 'test') {
      const pageSize = params?.page_size || 10;
      const mockPageData = Array(pageSize).fill(speciesMockData.data.data);
      return Promise.resolve({ data: { data: mockPageData } });
    } else if (endpoint === '/specimen:to-one/testSpecimenId/lazy_species' && baseURL === 'test') {
      return Promise.resolve(toOneSpeciesMockData);
    } else if (endpoint === '/_config/relationships' && baseURL === 'test') {
      return Promise.resolve({ data: relationshipConfigMockData });
    }
    return Promise.reject({ response: { status: 404 } });
  },
  delete(endpoint: string, { baseURL }: { baseURL: string, params?: any }) {
    if (endpoint === '/species/testSpeciesId' && baseURL === 'test') {
      return Promise.resolve(null);
    }
    return Promise.reject({ response: { status: 404 } });
  },
  post(endpoint: string, payload: { data: any }, config: { baseURL: string }) {
    if (endpoint === '/species:upsert' && config.baseURL === 'test') {
      return Promise.resolve(speciesUpsertMockData);
    }
    return Promise.reject({ response: { status: 404 } });
  }
});

// Need to adjust to account for the get config

const mockDataSource = new TsDataSource({
    baseUrl: 'test',
    client: mockClient,
  });


describe ('Testing getOne function', () => {
  test('ID does not exist in promise', async () => {

    // Call getOne function
    const dataObject = await mockDataSource.getOne({
      objectType: 'species',
      id: 'testSpeciesId',
    });

    const expectedData = speciesMockData.data.data;
    // Assert the result

    const rawData = {
      id: dataObject?.id,
      type: dataObject?.objectType,
      attributes: { name: dataObject?.name }
    };

    expect(JSON.stringify(rawData)).toBe(JSON.stringify(expectedData));
  });

  test('Multiple sequential calls with the same ID', async () => {
    const mockClientInstance = mockClient();
  
    // Spy on the client to check how many times it is called
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');
  
    // Second call should trigger an HTTP request
    const dataObject = await mockDataSource.getOne({
      objectType: 'species',
      id: 'testSpeciesId',
    });
  
    // Assert the result (Should be 0 because the data is already in the cache from the first test)
    expect(clientGetSpy).toHaveBeenCalledTimes(0);
    // Result should be the same as the data added in the first test due to caching
    const expectedData = speciesMockData.data.data;
    const rawData = {
      id: dataObject?.id,
      type: dataObject?.objectType,
      attributes: { name: dataObject?.name }
    };
    expect(JSON.stringify(rawData)).toBe(JSON.stringify(expectedData));
  });

  test('Adding new object type', async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.getOne({
      objectType: 'sample',
      id: 'testSampleId',
    });

    const expectedData = sampleMockData.data.data;
    // Assert the result

    const rawData = {
      id: dataObject?.id,
      type: dataObject?.objectType,
      attributes: { name: dataObject?.name }
    };

    expect(JSON.stringify(rawData)).toBe(JSON.stringify(expectedData));

  });

  test('Throws error when endpoint is wrong', async () => {
    const mockClientInstance = mockClient();

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.getOne({
      objectType: 'fail',
      id: 'fail',
    });
  
    expect(dataObject).toBeNull();
  });
})

describe ('Testing getByIds function', () => {

  test('Single ID request returns correct object', async () => {
    const dataObjects = await mockDataSource.getByIds({
      objectType: 'species',
      ids: ['testSpeciesId'],
    });

    expect(dataObjects).toHaveLength(1);
    expect(dataObjects[0]?.name).toEqual('test species');
    expect(dataObjects[0]?.id).toEqual('testSpeciesId');
    expect(dataObjects[0]?.objectType).toEqual('species');
  });

  test('Multiple ID request returns correct object', async () => {
    const dataObjects = await mockDataSource.getByIds({
      objectType: 'species',
      ids: ['testSpeciesId', 'testSpeciesId'],
    });

    expect(dataObjects).toHaveLength(2);
    expect(dataObjects[0]?.name).toEqual('test species');
    expect(dataObjects[0]?.id).toEqual('testSpeciesId');
    expect(dataObjects[0]?.objectType).toEqual('species');

    expect(dataObjects[1]?.name).toEqual('test species');
    expect(dataObjects[1]?.id).toEqual('testSpeciesId');
    expect(dataObjects[1]?.objectType).toEqual('species');
  });

  test('Invalid ID request returns null or empty object', async () => {
    const dataObjects = await mockDataSource.getByIds({
      objectType: 'species',
      ids: ['invalidId'],
    });

    expect(dataObjects).toHaveLength(1);
    expect(dataObjects[0]).toBeNull();
  });
})

describe ('Testing getListPage function', () => {
  test('Calls get correct page size', async () => {
    const dataObjects1 = await mockDataSource.getListPage({
      objectType: 'species',
      pageSize: 1,
    });

    const dataObjects2 = await mockDataSource.getListPage({
      objectType: 'species',
      pageSize: 20,
    });

    expect(dataObjects1).toHaveLength(1);
    expect(dataObjects2).toHaveLength(20);
  });

  test('Calls get correct data', async () => {
    const dataObjects = await mockDataSource.getListPage({
      objectType: 'species',
      pageSize: 1,
    });

    const dataObject = dataObjects[0];
    expect(dataObject).toBeDefined();
    expect(dataObject?.id).toEqual('testSpeciesId');
    expect(dataObject?.objectType).toEqual('species');
    expect(dataObject?.name).toEqual('test species');
  });

  test('Should return null on invalid objectType', async () => {
    const dataObjects = await mockDataSource.getListPage({
      objectType: 'fail',
      pageSize: 1,
    });

    expect(dataObjects).toBeNull();
  });
})

describe ('Testing attributeMetadata function', () => {
  test('Returns correct attribute metadata', async () => {
    // Use mockClient to mock the client and initialize TsDataSource
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');
    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    // Call attributeMetadata function
    const dataObject = await mockDataSource.attributeMetadata();

    // Expected data
    const expectedData = attributeMetadataMockData;

    // Assert the result
    expect(dataObject).toEqual(expectedData);
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test('Caches attribute metadata and does not call client again', async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    await mockDataSource.attributeMetadata();
    expect(clientGetSpy).toHaveBeenCalledTimes(0);
  });
})

describe ('Testing relationshipConfig function', () => {
  test('Returns correct attribute metadata', async () => {
    // Use mockClient to mock the client and initialize TsDataSource
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });
    const expectedData = relationshipConfigMockData;

    const dataObject = await mockDataSource.relationshipConfig();
    expect(dataObject).toEqual(expectedData);
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test('Caches relationship config and does not call client again', async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    await mockDataSource.relationshipConfig();
    expect(clientGetSpy).toHaveBeenCalledTimes(0);
  });
})

describe('Testing config functions retry on error', () => {
  test('Retries getConfig function 3 times on error', async () => {
    // Use mockClient to mock the client and initialize TsDataSource
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get').mockImplementation(() => {
      throw new Error('simulated error');
    });

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    try {
      await mockDataSource.getConfig('errored-url');
    } catch (error) {
      // expected to throw after 3 retries
    }

    expect(clientGetSpy).toHaveBeenCalledTimes(3);
  });
});

describe('Testing delete method', () => {
  test('Delete correctly removes value', async () => {
    // Use mockClient to mock the client and initialize TsDataSource
    const mockClientInstance = mockClient();
    const clientDeleteSpy = vitest.spyOn(mockClientInstance, 'delete');

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.deleteByID({
      objectType: 'species',
      id: 'testSpeciesId',
    });

    expect(dataObject).toBeUndefined();
    expect(clientDeleteSpy).toHaveBeenCalledTimes(1);

  });
});

describe('Testing upsert method', () => {
  test('Upserts value correctly', async () => {
    const mockClientInstance = mockClient();
    const clientPostSpy = vitest.spyOn(mockClientInstance, 'post');

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const dataObject = await mockDataSource.upsert({
      objectType: 'species',
      payload: [{
        type: 'species',
        id: 'newTestSpeciesId',
        attributes: {
          name: 'test species'
        },
      }]
    });
    expect(dataObject[0].id).toEqual('newTestSpeciesId');
    expect(clientPostSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Testing relationship getting', () => {
  test('Do not fetch explicit null', async () => {
    const mockClientInstance = mockClient();
    const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');
  
    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({objectType: 'specimen', id: 'testSpecimenId'});
    expect(specimen).not.toBeNull();
    expect(clientGetSpy).toHaveBeenCalledTimes(1);

    expect(await specimen.relationships.none_species).toBeNull();
    expect(clientGetSpy).toHaveBeenCalledTimes(1);
  });

  test('Do not fetch provided relation', async () => {
    const mockClientInstance = mockClient();
  
    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({objectType: 'specimen', id: 'testSpecimenId'});
    expect(specimen).not.toBeNull();

    const presentSpecies = await specimen.relationships.present_species;
    expect(presentSpecies.id).toEqual('present');
    expect(presentSpecies.objectType).toEqual('species');
  });

  test('Lazily fetch missing relation', async () => {
    const mockClientInstance = mockClient();
  
    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    const specimen = await mockDataSource.getOne({objectType: 'specimen', id: 'testSpecimenId'});
    expect(specimen).not.toBeNull();

    const lazySpecies = await specimen.relationships.lazy_species;

    expect(lazySpecies.id).toEqual('lazy');
    expect(lazySpecies.objectType).toEqual('species');
    expect(lazySpecies.lazy).toEqual(true);
  });
});
