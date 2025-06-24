/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock the react-leaflet-core module to avoid issues with Leaflet in tests
vi.mock("react-leaflet-cluster", () => ({
  __esModule: true,
  default: () => null,
}));

afterEach(() => {
  cleanup();
});
