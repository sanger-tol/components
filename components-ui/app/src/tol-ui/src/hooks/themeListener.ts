// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { useEffect } from "react"


export default function themeListener(fn: Function) { // eslint-disable-line
  useEffect(() => {
    fn()
  }, [])
  window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    return fn()
  })
}
