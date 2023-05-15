/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { render, screen } from '@testing-library/react';
import { Home } from './pages';

test('renders home page link', () => {
  render(<Home />);
  expect(screen.queryAllByText("Components")).not.toHaveLength(0);
});
