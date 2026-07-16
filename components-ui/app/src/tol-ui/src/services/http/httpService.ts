/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AxiosInstance, AxiosRequestConfig } from "axios";
import createAxiosInstance from "./axios";
import { CONFIG } from "../..";


const authApi = createAxiosInstance(CONFIG);

function normalizeBody(data: unknown) {
  if (!(data instanceof FormData)) {
    if (typeof data === "object" && data != null) {
      data = JSON.stringify(data);
    }
  }
  return data;
}
function wrapClientWithContext(client: AxiosInstance, accessToken = "") {
  const authHeader = accessToken ? { Token: `${accessToken}` } : {};
  const defaultOption = {
    headers: {
      ...CONFIG.headers,
      ...authHeader,
    },
  };

  const buildBodyConfig = (
    isFormData: boolean,
    options: AxiosRequestConfig,
  ): AxiosRequestConfig => {
    const headers = { ...defaultOption.headers, ...options.headers };
    if (isFormData) {
      delete (headers as Record<string, unknown>)["Content-Type"];
    }
    return { ...defaultOption, ...options, headers };
  };

  return {
    get<TResponse>(endPoint: string, options: AxiosRequestConfig = {}) {
      return client.get<TResponse>(endPoint, {
        ...defaultOption,
        ...options,
      });
    },
    post<TResponse>(
      endPoint: string,
      data: unknown,
      options: AxiosRequestConfig = {},
    ) {
      const config = buildBodyConfig(data instanceof FormData, options);
      data = normalizeBody(data);
      return client.post<TResponse>(endPoint, data, config);
    },
    put(endPoint: string, data: unknown, options: AxiosRequestConfig = {}) {
      const config = buildBodyConfig(data instanceof FormData, options);
      data = normalizeBody(data);
      return client.put(endPoint, data, config);
    },
    patch(endPoint: string, data: unknown, options: AxiosRequestConfig = {}) {
      const config = buildBodyConfig(data instanceof FormData, options);
      data = normalizeBody(data);
      return client.patch(endPoint, data, config);
    },
    delete(endPoint: string, options: AxiosRequestConfig = {}) {
      return client.delete(endPoint, {
        ...defaultOption,
        ...options,
      });
    },
    client,
  };
}

export function httpServices(accessToken = "") {
  return wrapClientWithContext(authApi, accessToken);
}
