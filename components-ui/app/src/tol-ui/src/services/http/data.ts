/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { httpClient } from './httpClient';


export async function fetchData(id: string, endpoint: string, baseUrl?: string) {
  return await httpClient().get('/' + endpoint + '/' + id, {
    baseURL: baseUrl
  }).then((res: any) => {
    return res;
  })
}

const pendingPromises: {
  [endpoint: string]: Promise<object>
} = {};

const detailCache: {
  [key: string]: {
    [key: string]: number
  }
} = {};

export async function fetchDetail(id: string, endpoint: string, baseUrl?: string): Promise<object> {
  if (!pendingPromises[endpoint]) {
    pendingPromises[endpoint] = Promise.resolve({});
  }
  pendingPromises[endpoint] = pendingPromises[endpoint].then(async () => {
    if (!(endpoint in detailCache)) detailCache[endpoint] = {};
    if (id in detailCache[endpoint]) return detailCache[endpoint][id];
    const retrievedData = await fetchData(id, endpoint, baseUrl);
    detailCache[endpoint][id] = retrievedData;
    return retrievedData;
  });
  return pendingPromises[endpoint];
}
