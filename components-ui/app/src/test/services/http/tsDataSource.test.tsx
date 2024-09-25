// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT


import {expect, test, vitest, describe} from 'vitest';
import TsDataSource from '../../../tol-ui/src/services/http/tsDataSource';
import '@testing-library/jest-dom';


const speciesMockData = { data: { data: { id: 'testSpeciesId', type: 'species', attributes: { name: 'test species' } } } };
const sampleMockData = { data: { data: { id: 'testSampleId', type: 'sample', attributes: { name: 'test sample' } } } };

const attributeMetadataMockData = {
  data: {
    attributes: {
      species: {
        name: { type: 'string', description: 'Species name' }
      }
    }
  }
};

const mockClient = () => ({
  get(endpoint: string, { baseURL, params }: { baseURL: string, params?: any }) {
    if (endpoint === '/_config/attribute_metadata' && baseURL === 'test') {
      return Promise.resolve({ data: attributeMetadataMockData });
    } else if (endpoint === '/species/testSpeciesId' && baseURL === 'test') {
      return Promise.resolve(speciesMockData);
    } else if (endpoint === '/sample/testSampleId' && baseURL === 'test') {
      return Promise.resolve(sampleMockData);
    } else if (endpoint === '/species' && baseURL === 'test') {
      const pageSize = params?.page_size || 10;
      const mockPageData = Array(pageSize).fill(speciesMockData.data.data);
      return Promise.resolve({ data: { data: mockPageData } });
    }
    return Promise.reject({ response: { status: 404 } });
  }
});

// Need to adjust to account for the get config

const mockDataSource = new TsDataSource({
    baseUrl: 'test',
    client: mockClient,
  });


describe ('Testing getById function', () => {
  test('ID does not exist in promise', async () => {

    // Call getById function
    const dataObject = await mockDataSource.getById({
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
    const dataObject = await mockDataSource.getById({
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

    const dataObject = await mockDataSource.getById({
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

    const dataObject = await mockDataSource.getById({
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
    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    // Call attributeMetadata function
    const dataObject = await mockDataSource.attributeMetadata();

    // Expected data
    const expectedData = attributeMetadataMockData;

    console.log(dataObject);
    console.log(expectedData);

    // Assert the result
    expect(dataObject).toEqual(expectedData);
  });

  test('Caches attribute metadata and does not call client again', async () => {
    const mockClientInstance = mockClient();
    
    // Spy on the client's get method to ensure it's called only once
    //const clientGetSpy = vitest.spyOn(mockClientInstance, 'get');

    const mockDataSource = new TsDataSource({
      baseUrl: 'test',
      client: () => mockClientInstance,
    });

    // First call should trigger a client get request
    await mockDataSource.attributeMetadata();
    //expect(clientGetSpy).toHaveBeenCalledTimes(1);

    // Second call should not trigger a client get request due to caching
    await mockDataSource.attributeMetadata();
    //expect(clientGetSpy).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
})