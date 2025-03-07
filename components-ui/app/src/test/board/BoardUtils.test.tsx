/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import { deepCopy } from "../../tol-ui/src/general/utils";
import {
  defineComponent,
  defineZone,
  getWidgetOrder,
} from "../../tol-ui/src/boards/utils";
import { IComponentData } from "../../tol-ui/src/boards/utils";

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
