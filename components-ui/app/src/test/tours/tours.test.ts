/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockLocalStorage } from "../mocks/builtin";
import { hasTourBeenSeen, User } from "../../tol-ui/src";

describe("hasTourBeenSeen", () => {
  let mockLocalStorage: MockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockLocalStorage();
    vi.stubGlobal("localStorage", mockLocalStorage);
  });

  it("returns false when tour has not been seen and user unauthenticated", async () => {
    // User is `null` when unauthenticated
    const user = null;
    
    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(false);
  });

  it("returns false when tour has not been been seen and user authenticated", async () => {
    const user: User = {
      id: "0",
      name: "Name",
      email: "name@example.com",
      organisation: "Unit Test LTD",
      roles: ["tol"],
      tours_seen: {}
    };

    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(false);
  });

  it("returns false when tours_seen is NULL and user authenticated", async () => {
    const user: User = {
      id: "0",
      name: "Name",
      email: "name@example.com",
      organisation: "Unit Test LTD",
      roles: ["tol"],
      tours_seen: null
    };

    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(false);
  });

  it("returns true when tour has been seen and user unauthenticated", async () => {
    // Add a seen tour
    mockLocalStorage.setItem("toursSeen", JSON.stringify({ "tour": true }))

    // User is `null` when unauthenticated
    const user = null;

    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(true);
  });

  it("returns true when tour has been seen and user authenticated", async () => {
    const user: User = {
      id: "0",
      name: "Name",
      email: "name@example.com",
      organisation: "Unit Test LTD",
      roles: ["tol"],
      tours_seen: {
        "tour": true
      }
    };

    const result = await hasTourBeenSeen("tour", user);
    expect(result).toBe(true);
  });
});
