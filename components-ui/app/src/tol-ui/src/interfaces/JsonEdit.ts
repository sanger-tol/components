/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

export interface IJsonSchema {
  data: {
    title: string;
    description: string;
    version: string;
    properties: {
      [key: string]: unknown;
    };
  };
}

export interface IJsonData {
  [key: string]: unknown;
}

export type TJsonSchemaOrNull = IJsonSchema | null;