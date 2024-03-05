// SPDX-FileCopyrightText: 2023 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { useEffect } from "react"


export function themeListener(fn: Function) { // eslint-disable-line
  useEffect(() => {
    fn()
  }, [])
  window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    return fn()
  })
}

export function windowSizeListener(fn: Function) { // eslint-disable-line
  useEffect(() => {
    fn()
  }, [])
  window.addEventListener('resize', () => {
    return fn()
  }, true)
}
