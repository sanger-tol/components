/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export function convertToPath(name: string) {
  let path = name.toLowerCase()
  return path.replace(/\s+/g, '-');
}

function _normaliseCaps(title: string) {
  const words = title.split("_");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substring(1);
  }
  return words.join(" ");
}

export function convertTableData(data: any[]) {
  const updated_data: any[] = []
  data.forEach(row => {
    updated_data.push(Object.assign({}, { "id": row.id }, row.attributes))
  });
  return updated_data;
}

export function convertHeadingData(headings: any[]) {
  const updated_headings: any[] = [{
    dataField: "id",
    text: "ID"
  }]
  headings.forEach(heading => {
    updated_headings.push({
      dataField: heading,
      text: _normaliseCaps(heading)
    });
  });
  return updated_headings
}

export default convertToPath;
