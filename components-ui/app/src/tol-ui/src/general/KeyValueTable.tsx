/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IKeyValueTableRow } from "..";

export interface PKeyValueTable {
  /** Fields displayed in table order. */
  rows: IKeyValueTableRow[];
}

/**
 * @autodoc
 *
 * Displays ordered key-value rows.
 */
export function KeyValueTable({ rows }: PKeyValueTable) {
  if (rows.length === 0) return null;

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
