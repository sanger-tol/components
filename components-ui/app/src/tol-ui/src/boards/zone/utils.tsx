/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IZone } from "../..";


export function getNextOrder(zone: IZone) {
  const highestOrder = Object.values(zone.components).reduce(
    (max, component) => {
      return component.data.order! > max ? component.data.order : max;
    },
    0,
  );
  return highestOrder! + 1;
}
