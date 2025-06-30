/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.
SPDX-License-Identifier: MIT
*/

/**
 * Decorator that retries an asynchronous method upon failure.
 *
 * @param {number} retries - The maximum number of retry attempts.
 * @returns {Function} A decorator function for the target method.
 *
 * @example
 * class ApiService {
 *   @retry(3)
 *   async fetchData() {
 *     // ...fetch data...
 *   }
 * }
 *
 * The decorator wraps the original method and attempts its execution.
 * When an error is thrown, it will retry until the maximum number
 * of attempts is reached. If the final attempt fails, the error is re-thrown.
 */
export function retry(retries: number) {
  return function (
    // @ts-ignore
    target: any,
    // @ts-ignore
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i < retries; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (i === retries - 1) throw error;
        }
      }
    };

    return descriptor;
  };
}
