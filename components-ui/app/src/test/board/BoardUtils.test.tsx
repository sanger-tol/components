/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {expect, test, describe} from 'vitest';
import { deepCopy } from '../../tol-ui/src/general/Utils'
import {
    defineComponent,
    defineZone,
    getWidgetOrder
} from '../../tol-ui/src/board/Utils'

describe ('defineComponent function', () => {

  test('should add a component to the zone', () => {
    const mockComponent = {
      id: 1,
      filter: { and_: { field: 'value' } }
    }
    const mockZone = {
      components: {}
  }

    // Act
    defineComponent(mockComponent, mockZone);

    // Assert
    expect(mockZone.components).toHaveProperty(String(mockComponent.id));
    const addedComponent = mockZone.components[mockComponent.id];
    expect(addedComponent).toBeDefined();
    expect(addedComponent.data.filter).toEqual(deepCopy(mockComponent.filter));
    expect(addedComponent.data.defaultFilter).toEqual(deepCopy(mockComponent.filter));
  })

  test('should use an empty filter if none is provided', () => {
    // Arrange
    const mockZone = {
      components: {}
    };
    const mockComponent = {
      id: 'testId'
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

describe ('defineZone function', () => {

  test('should create a zone', () => {
    // Arrange
    const mockComponents = [
      {
        id: 1
      },
      {
        id: 2
      }
    ];

    const objectType = 'mockObjectType';

    // Act
    const zone = defineZone(objectType, mockComponents);

    // Assert
    expect(zone.type).toEqual(objectType);
    expect(zone.order).toEqual(mockComponents.map(c => c.id));
    for (const component of mockComponents) {
      expect(zone.components).toHaveProperty(String(component.id));
      const addedComponent = zone.components[component.id];
      expect(addedComponent).toBeDefined();
    }
  })

  test('should create an empty zone', () => {
    // Arrange
    const mockComponents = [];
    const objectType = 'mockObjectType';

    // Act
    const zone = defineZone(objectType, mockComponents);

    // Assert
    expect(zone.type).toEqual(objectType);
    expect(zone.order).toEqual([]);
    expect(zone.components).toEqual({});
  })

});

describe ('getWidgetOrder function', () => {

  test('return the correct order', () => {
    // Arrange
    const mockLayout = [
      {w:4, x:0, y:0, h:2, i:1},
      {w:4, x:0, y:2, h:2, i:2},
    ]
    const mockWidgets = {
      components: {
        1: {
          element: <></>,
          size: 'large'
        },
        2: {
          element: <></>,
          size: 'large'
        }
      },
      order: [2,1]
    }

    // Act
    const order = getWidgetOrder(mockLayout, mockWidgets);
    expect(order.order).toEqual([1,2])
  })

  test('order already in the correct order', () => {
    // Arrange
    const mockLayout = [
      {w:4, x:0, y:0, h:2, i:1},
      {w:4, x:0, y:2, h:2, i:2},
    ]
    const mockWidgets = {
      components: {
        1: {
          element: <></>,
          size: 'large'
        },
        2: {
          element: <></>,
          size: 'large'
        }
      },
      order: [1,2]
    }

    // Act
    const order = getWidgetOrder(mockLayout, mockWidgets);
    expect(order.order).toEqual([1,2])
  })

});