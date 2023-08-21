/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';


function dealWithFilterStates(globalFilters: object, localFilters: object) {
  const [ combinedFilters, setCombinedFilters ] = useState<object>(
    Object.assign({}, localFilters, globalFilters)
  )

  useEffect(() => {
    async function combine() {
      setCombinedFilters(Object.assign({}, localFilters, globalFilters))
    }
    combine()
  }, [localFilters])

  useEffect(() => {
    async function resetCombined() {
      setCombinedFilters(Object.assign({}, globalFilters))
    }
    resetCombined()
  }, [globalFilters])

  return combinedFilters
}

export default dealWithFilterStates;
