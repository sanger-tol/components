/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface PObjectDetail {
  data: object;
}

export function ObjectDetail(props: PObjectDetail) {
  const { data } = props;

  return (
    <div className="tol-object-detail">
      {Object.entries(data).map(([key, value]) => (
        <p key={key}>
          <strong>{key}:</strong> {value}
        </p>
      ))}
    </div>
  );
}
