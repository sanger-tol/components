/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.
SPDX-License-Identifier: MIT
*/

/**
 * Decorator that retries an asynchronous method upon failure.
 *
 * @returns {Function} A decorator function for the target method.
 *
 * @example
 * class ApiService {
 *   @clearExpiredToken()
 *   async fetchData() {
 *     // ...fetch data...
 *   }
 * }
 *
 * The decorator wraps the original method and attempts its execution.
 * When a 401 error is thrown, it will clear the token from local storage.
 */
export function clearExpiredToken() {
  return function (
    // @ts-ignore
    target: any,
    // @ts-ignore
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        throw error;
      }
    };

    return descriptor;
  };
}
