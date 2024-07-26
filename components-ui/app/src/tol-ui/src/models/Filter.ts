/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface AndFilter {
  [operator: string]: {
    value?: any,
    negate?: boolean
  }
}

export interface And {
  [attribute: string]: AndFilter
}

export default interface Filter {
  and_: And
}
