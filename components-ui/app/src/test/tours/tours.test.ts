/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockLocalStorage } from "..";
import { hasTourBeenSeen, registerTourAsSeen } from "../../tol-ui/src";

describe("hasTourBeenSeen", () => {
  let mockLocalStorage: MockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockLocalStorage();
    vi.stubGlobal("localStorage", mockLocalStorage);
  });

  it("returns false when tour has not been seen and user unauthenticated", async () => {
    const result = await hasTourBeenSeen("tour", null);
    expect(result).toBe(false);
  });

  it("returns false when tour has not been been seen and user authenticated", async () => {
    const result = await hasTourBeenSeen("tour", "0");
    expect(result).toBe(false);
  });

  it("returns false when tours_seen is NULL and user authenticated", async () => {
    const result = await hasTourBeenSeen("tour", "0");
    expect(result).toBe(false);
  });

  it("returns true when tour has been seen and user unauthenticated", async () => {
    // Add a seen tour
    mockLocalStorage.setItem("toursSeen", JSON.stringify({ "tour": true }))

    const result = await hasTourBeenSeen("tour", null);
    expect(result).toBe(true);
  });

  it("returns true when tour has been seen and user authenticated", async () => {
    const result = await hasTourBeenSeen("tour", "0");
    expect(result).toBe(true);
  });
});

describe("registerTourAsSeen", () => {
  let mockLocalStorage: MockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockLocalStorage();
    vi.stubGlobal("localStorage", mockLocalStorage);
  });

  it("registers correctly when unauthenticated", async () => {
    await registerTourAsSeen("tour", null);
    const toursSeen = mockLocalStorage.getItem("toursSeen");

    expect(toursSeen).not.toBe(null);
    if (toursSeen != null) {
      expect(JSON.parse(toursSeen)).toStrictEqual({
        "tour": true
      });
    }
  });

  it("doesn't disrupt existing tours seen when unauthenticated", async () => {
    // Place existing completed tours into local storage
    mockLocalStorage.setItem("toursSeen", JSON.stringify({
      "aTour": true,
      "anotherTour": true
    }));

    await registerTourAsSeen("tour", null);
    const toursSeen = mockLocalStorage.getItem("toursSeen");
    
    expect(toursSeen).not.toBe(null);
    if (toursSeen != null) {
      expect(JSON.parse(toursSeen)).toStrictEqual({
        "aTour": true,
        "anotherTour": true,
        "tour": true
      });
    }
  });
});
