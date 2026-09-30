/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Converts a column name and sort direction into the API sort format used by the backend.
 *
 * @param sortColumn The column to sort by.
 * @param sortType The sort direction, typically "asc" or "desc".
 * @returns The API sort value, or `undefined` when no column is provided.
 */
export function createSort(sortColumn?: string, sortType?: string) {
  if (!sortColumn) return undefined;
  if (sortType === "desc" && !sortColumn.startsWith("-")) {
    return `-${sortColumn}`;
  }
  return sortColumn;
}

/**
 * Builds the localStorage key used for a component config.
 *
 * @param componentId The unique id for the component.
 * @returns The localStorage key for the component config.
 */
function getComponentConfigKey(componentId: string): string {
  return `component-config-${componentId}`;
}

/**
 * Reads the saved configuration for a component from localStorage.
 *
 * @param componentId The unique id for the component.
 * @returns The saved config object, or `undefined` when nothing is stored.
 */
export function getComponentConfigLocalStorage<T extends object>(componentId: string): Partial<T> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storedConfig = localStorage.getItem(getComponentConfigKey(componentId));
  if (!storedConfig) {
    return undefined;
  }

  try {
    return JSON.parse(storedConfig) as Partial<T>;
  } catch {
    return undefined;
  }
}

/**
 * Persists a component configuration to localStorage.
 *
 * @param componentId The unique id for the component.
 * @param config The configuration values to save.
 */
export function saveComponentConfigLocalStorage<T extends object>(componentId: string, config: T): void {
  if (typeof window === "undefined") {
    return;
  }

  const existingConfig = getComponentConfigLocalStorage<T>(componentId) ?? {};
  const nextConfig: T = {
    ...existingConfig,
    ...config,
  };

  localStorage.setItem(getComponentConfigKey(componentId), JSON.stringify(nextConfig));
}

/**
 * Removes the saved configuration for a component from localStorage.
 *
 * @param componentId The unique id for the component.
 */
export function clearComponentConfigLocalStorage(componentId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(getComponentConfigKey(componentId));
}
