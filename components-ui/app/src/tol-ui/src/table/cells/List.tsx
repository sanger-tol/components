/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  PCell
} from "../..";


export function List(props: PCell) {
  const { value } = props;

  return (
    <div className="simple-tag-container">
      {value.map((item: any) => {
        return (
          <div className="simple-tag" key={item}>
            {item}
          </div>
        );
      })}
    </div>
  );
}
