/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export default function retry(retries: number) {
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
