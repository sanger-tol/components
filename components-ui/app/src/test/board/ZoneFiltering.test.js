// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { render, screen, fireEvent, expect, test, describe } from '@jest/globals';
import { ResponsiveWidget } from '../../tol-ui/src';
import { Zone, getWidgetOrder } from './Utils';
import { resetAllFilters, removeComponent } from '../filtering/Utils';


jest.mock('../../tol-ui/src/board/Utils', () => ({
  ...jest.requireActual('../../tol-ui/src/board/Utils'),
  getWidgetOrder: jest.fn(),
}));

jest.mock('../../tol-ui/src/filtering/Utils', () => ({
  ...jest.requireActual('../../tol-ui/src/filtering/Utils'),
  resetAllFilters: jest.fn(),
  removeComponent: jest.fn(),
}));

const initialWidgets = {
  components: {
    widget1: { size: 'small', element: <div>Widget 1</div> },
    widget2: { size: 'medium', element: <div>Widget 2</div> },
  },
  order: ['widget1', 'widget2']
};

const zoneMock = {
  components: {},
  order: []
};

describe('ResponsiveWidget', () => {
  let setWidgetsMock, setOrderMock, setZoneMock;

  beforeEach(() => {
    setWidgetsMock = jest.fn();
    setOrderMock = jest.fn();
    setZoneMock = jest.fn();
  });

  test('deletes a widget and updates the order', () => {
    render(
      <ResponsiveWidget
        id="test-zone"
        widgets={initialWidgets}
        draggable={true}
        setWidgets={setWidgetsMock}
        setOrder={setOrderMock}
        zone={zoneMock}
        setZone={setZoneMock}
      />
    );

    const deleteButton = screen.getAllByRole('button', { name: /trash/i })[0];
    fireEvent.click(deleteButton);

    expect(removeComponent).toHaveBeenCalledWith('widget1', zoneMock);
    expect(resetAllFilters).toHaveBeenCalledWith(zoneMock);
    expect(setWidgetsMock).toHaveBeenCalledWith({
      components: { widget2: { size: 'medium', element: <div>Widget 2</div> } },
      order: ['widget2'],
    });
  });

  test('updates the order on layout change', () => {
    getWidgetOrder.mockReturnValueOnce({
      order: ['widget2', 'widget1'],
    });

    render(
      <ResponsiveWidget
        id="test-zone"
        widgets={initialWidgets}
        draggable={true}
        setWidgets={setWidgetsMock}
        setOrder={setOrderMock}
        zone={zoneMock}
        setZone={setZoneMock}
      />
    );

    // Simulate layout change
    const newLayout = [
      { i: 'widget2', x: 0, y: 0, w: 2, h: 2 },
      { i: 'widget1', x: 2, y: 0, w: 1, h: 1 },
    ];
    const responsiveGrid = screen.getByRole('grid');
    fireEvent.layoutChange(responsiveGrid, newLayout);

    expect(setOrderMock).toHaveBeenCalledWith({ order: ['widget2', 'widget1'] });
    expect(zoneMock.order).toEqual(['widget2', 'widget1']);
  });
});