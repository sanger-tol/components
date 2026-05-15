/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockLocalStorage } from "../mocks/builtin";
import { hasTourBeenSeen } from "../../tol-ui/src";

describe("hasTourBeenSeen", () => {
  let mockLocalStorage: MockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockLocalStorage();
    vi.stubGlobal("localStorage", mockLocalStorage);
  });

  it("returns false when tour has not been seen and unauthenticated", async () => {
    // User is `null` when unauthenticated
    const user = null;
    
    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(false);
  });

  it("returns true when tour has been seen and unauthenticated", async () => {
    // Add a seen tour
    mockLocalStorage.setItem("toursSeen", JSON.stringify({ "tour": true }))

    // User is `null` when unauthenticated
    const user = null;

    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(true);
  });
});
