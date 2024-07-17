// SPDX-FileCopyrightText: 2024 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { httpClient } from './httpClient';


export async function fetchData(endpoint: string, baseUrl?: string) {
  return await httpClient().get(endpoint, {
    baseURL: baseUrl
  }).then((res) => {
    return res.data;
  })
}
