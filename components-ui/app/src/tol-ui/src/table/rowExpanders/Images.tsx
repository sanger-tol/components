/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface PImages {
  value: any;
  names: any;
}

export function Images(props: PImages) {
  const { value, names } = props;

  // could be single or multiple images
  const urlList = Array.isArray(value) ? value : [value];
  return (
    <div className="tol-table-expanded-row">
      {urlList.map((url, index) => (
        <img
          className="tol-table-expanded-row-img"
          key={url}
          src={url}
          alt={names[index] || url}
        />
      ))}
    </div>
  );
}
