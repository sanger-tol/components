/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface IComponentExample {
  title?: string;
  code: string;
  description?: string;
}

export interface IComponentDocumentation {
  name: string;
  filePath: string;
  description?: string;
  props: IComponentProp[];
  examples: IComponentExample[];
  remarks?: string[];
}
