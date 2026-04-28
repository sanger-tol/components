/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe, vi } from "vitest";
import {
  deepCopy,
  defineComponent,
  defineZone,
  getWidgetOrder,
  IComponentData,
  IZone,
  TsDataSource,
  updateConfigAndUpsert,
} from "../../tol-ui/src";

vi.mock("rsuite", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    toaster: {
      push: vi.fn(),
    },
  };
});


describe("defineComponent function", () => {
  test("should add a component to the zone", () => {
    const mockComponent: IComponentData = {
      id: "1",
      filter: {
        and_: {},
      },
    };
    const mockZone = {
      components: {},
      order: [],
    };

    // Act
    defineComponent(mockComponent, mockZone);

    // Assert
    expect(mockZone.components).toHaveProperty(String(mockComponent.id));
    const addedComponent = mockZone.components[mockComponent.id!];
    expect(addedComponent).toBeDefined();
    expect(addedComponent.data.filter).toEqual(deepCopy(mockComponent.filter));
    expect(addedComponent.data.defaultFilter).toEqual(
      deepCopy(mockComponent.filter),
    );
  });

  test("should use an empty filter if none is provided", () => {
    // Arrange
    const mockZone = {
      components: {},
      order: [],
    };
    const mockComponent = {
      id: "testId",
    };

    // Act
    defineComponent(mockComponent, mockZone);

    // Assert
    expect(mockZone.components).toHaveProperty(String(mockComponent.id));
    const addedComponent = mockZone.components[mockComponent.id];
    expect(addedComponent).toBeDefined();
    expect(addedComponent.data.filter).toEqual({ and_: {} });
    expect(addedComponent.data.defaultFilter).toEqual({ and_: {} });
  });
});

describe("defineZone function", () => {
  test("should create a zone", () => {
    // Arrange
    const mockComponents: IComponentData[] = [
      {
        id: "1",
      },
      {
        id: "2",
      },
    ];

    const objectType = "mockObjectType";

    // Act
    const zone = defineZone(objectType, mockComponents);

    // Assert
    expect(zone.type).toEqual(objectType);
    expect(zone.order).toEqual(mockComponents.map((c) => c.id));
    for (const component of mockComponents) {
      expect(zone.components).toHaveProperty(String(component.id));
      const addedComponent = zone.components[component.id!];
      expect(addedComponent).toBeDefined();
    }
  });

  test("should create an empty zone", () => {
    // Arrange
    const mockComponents = [];
    const objectType = "mockObjectType";

    // Act
    const zone = defineZone(objectType, mockComponents);

    // Assert
    expect(zone.type).toEqual(objectType);
    expect(zone.order).toEqual([]);
    expect(zone.components).toEqual({});
  });
});

describe("getWidgetOrder function", () => {
  test("return the correct order", () => {
    // Arrange
    const mockLayout = [
      { w: 4, x: 0, y: 0, h: 2, i: 1 },
      { w: 4, x: 0, y: 2, h: 2, i: 2 },
    ];

    // Act
    const order = getWidgetOrder(mockLayout);
    expect(order.order).toEqual([1, 2]);
  });

  test("order already in the correct order", () => {
    // Arrange
    const mockLayout = [
      { w: 4, x: 0, y: 0, h: 2, i: 1 },
      { w: 4, x: 0, y: 2, h: 2, i: 2 },
    ];

    // Act
    const order = getWidgetOrder(mockLayout);
    expect(order.order).toEqual([1, 2]);
  });
});

describe("updateConfigAndUpsert function", () => {
  test("marks a component as having a diff after the config save completes", async () => {
    let resolveUpsert: (value: unknown) => void = () => {};
    const upsertPromise: Promise<unknown> = new Promise((resolve) => {
      resolveUpsert = resolve;
    });
    const boardDataSource: Pick<
      TsDataSource,
      "getList" | "getListPage" | "upsert"
    > = {
      getList: vi.fn().mockResolvedValue([]),
      getListPage: vi.fn().mockResolvedValue({ data: [] }),
      upsert: vi.fn().mockReturnValue(upsertPromise),
    };
    const setHasDiff = vi.fn();
    const zone: IZone = {
      components: {
        component1: {
          data: {
            config: {},
          },
        },
      },
      order: [],
    };

    const savePromise = updateConfigAndUpsert(
      "component1",
      { fieldMeta: { order: { active: ["a"] } } },
      zone,
      boardDataSource as TsDataSource,
      false,
      setHasDiff,
      "user1",
    );

    await Promise.resolve();
    expect(setHasDiff).not.toHaveBeenCalled();

    resolveUpsert({});
    await savePromise;

    expect(boardDataSource.getListPage).toHaveBeenCalledWith({
      objectType: "board_diff",
      filter: {
        and_: {
          component_id: { eq: { value: "component1" } },
          user_id: { eq: { value: "user1" } },
        },
      },
      requestedFields: ["id"],
    });
    expect(boardDataSource.upsert).toHaveBeenCalledWith({
      objectType: "board_diff",
      payload: [
        {
          type: "board_diff",
          attributes: {
            config: { fieldMeta: { order: { active: ["a"] } } },
            component_id: "component1",
            user_id: "user1",
          },
        },
      ],
    });
    expect(setHasDiff).toHaveBeenCalledWith(true);
  });
});
