/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

function convertToPath(name: string) {
  let path = name.toLowerCase()
  return path.replace(/\s+/g, '-');
}

export default convertToPath;