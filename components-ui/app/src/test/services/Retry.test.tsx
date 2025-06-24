/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import { retry } from "../../tol-ui/src/services/http/retry";
import "@testing-library/jest-dom";

class PassingTestClass {
  callCount = 0;

  @retry(3)
  async unreliableMethod() {
    this.callCount++;
    if (this.callCount < 3) {
      throw new Error("Simulated error");
    }
    return "Success";
  }
}

class FailingTestClass {
  callCount = 0;

  @retry(5)
  async alwaysFailingMethod() {
    this.callCount++;
    throw new Error("Simulated error");
  }
}

describe("Testing retry decorator", () => {
  test("Retries the method 3 times before succeeding", async () => {
    const testInstance = new PassingTestClass();

    const result = await testInstance.unreliableMethod();

    expect(result).toBe("Success");
    expect(testInstance.callCount).toBe(3);
  });

  test("Throws error after 3 failed attempts", async () => {
    const failingTestInstance = new FailingTestClass();

    await expect(failingTestInstance.alwaysFailingMethod()).rejects.toThrow(
      "Simulated error",
    );
    expect(failingTestInstance.callCount).toBe(5);
  });
});
