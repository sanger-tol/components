/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import {
  deepCopy,
  defineZoneWithComponentList,
  getWidgetOrder,
  IComponent,
  IZone,
} from "../../tol-ui/src";


describe("addComponentToZone function", () => {
  test("should add a component to the zone", () => {
    const mockComponent: IComponent = {
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
    addComponentToZone(mockComponent, mockZone);

    // Assert
    expect(mockZone.components).toHaveProperty(String(mockComponent.id));
    const addedComponent: IComponent = mockZone.components[mockComponent.id!];
    expect(addedComponent).toBeDefined();
    expect(addedComponent.filter).toEqual(deepCopy(mockComponent.filter));
    expect(addedComponent.defaultFilter).toEqual(
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
    addComponentToZone(mockComponent, mockZone);

    // Assert
    expect(mockZone.components).toHaveProperty(String(mockComponent.id));
    const addedComponent: IComponent = mockZone.components[mockComponent.id];
    expect(addedComponent).toBeDefined();
    expect(addedComponent.filter).toEqual({ and_: {} });
    expect(addedComponent.defaultFilter).toEqual({ and_: {} });
  });
});

describe("defineZoneWithComponentList function", () => {
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
    const zone = defineZoneWithComponentList(objectType, mockComponents);

    // Assert
    expect(zone.objectType).toEqual(objectType);
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
    const zone: IZone = defineZoneWithComponentList(objectType, mockComponents);

    // Assert
    expect(zone.objectType).toEqual(objectType);
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
