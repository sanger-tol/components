/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFilter, ReadOnlyFilters, TsDataSource } from "../tol-ui/src";

export function Sandbox() {
  const filter: IFilter = {
    and_: {
      "first": {
        "exists": {
          negate: true,
        }
      },
      "second": {
        "eq": {
          value: "test",
        }
      }
    }
  };
  const objectType = "species";
  const dataSource = new TsDataSource();

  return <ReadOnlyFilters filter={filter} objectType={objectType} dataSource={dataSource} />;
}
