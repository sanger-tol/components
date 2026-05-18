/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockLocalStorage } from "..";
import { hasTourBeenSeen, registerTourAsSeen } from "../../tol-ui/src";

class MockDataSource {
  private user;

  constructor(initialValue) {
    this.user = { tours_seen: initialValue };
  }

  getOne(..._params) {
    return this.user;
  }

  upsert({ payload }) {
    this.user.tours_seen = payload[0].attributes.tours_seen;
  }

  get toursSeen() {
    return this.user.tours_seen;
  }
}

describe("hasTourBeenSeen", () => {
  let mockLocalStorage: MockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockLocalStorage();
    vi.stubGlobal("localStorage", mockLocalStorage);
  });

  it("returns false when tour has not been seen and user unauthenticated", async () => {
    mockLocalStorage.setItem("toursSeen", JSON.stringify({}));

    const result = await hasTourBeenSeen("tour", null);
    expect(result).toBe(false);
  });

  it("returns false when tour has not been been seen and user authenticated", async () => {
    const mockDataSource = new MockDataSource({});

    const result = await hasTourBeenSeen("tour", "0", mockDataSource as any);
    expect(result).toBe(false);
  });

  it("returns false when tours_seen is NULL and user authenticated", async () => {
    const result = await hasTourBeenSeen("tour", null);
    expect(result).toBe(false);
  });

  it("returns false when tours_seen is NULL and user authenticated", async () => {
    const mockDataSource = new MockDataSource(null);

    const result = await hasTourBeenSeen("tour", "0", mockDataSource as any);
    expect(result).toBe(false);
  });

  it("returns true when tour has been seen and user unauthenticated", async () => {
    // Add a seen tour
    mockLocalStorage.setItem("toursSeen", JSON.stringify({ "tour": true }));

    const result = await hasTourBeenSeen("tour", null);
    expect(result).toBe(true);
  });

  it("returns true when tour has been seen and user authenticated", async () => {
    const mockDataSource = new MockDataSource({ "tour": true });

    const result = await hasTourBeenSeen("tour", "0", mockDataSource as any);
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

  it("registers correctly when authenticated", async () => {
    const mockDataSource = new MockDataSource({});

    await registerTourAsSeen("tour", "0", mockDataSource as any);
    const toursSeen = mockDataSource.toursSeen;

    expect(toursSeen).toStrictEqual({ "tour": true });
  })

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

  it("doesn't disrupt existing tours seen when authenticated", async () => {
    const mockDataSource = new MockDataSource({
      "aTour": true,
      "anotherTour": true
    });

    await registerTourAsSeen("tour", "0", mockDataSource as any);
    const toursSeen = mockDataSource.toursSeen;

    expect(toursSeen).toStrictEqual({
      "aTour": true,
      "anotherTour": true,
      "tour": true
    });
  });
});
