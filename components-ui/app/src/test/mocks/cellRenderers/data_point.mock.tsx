/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TDataObjectOrNull } from "../../../tol-ui/src";


export const getDataPointObjectMock = () => ({
  mobile: 123456789,
  address: {
    city : "London",
    location: {
      coordinates: {
        latitude: 51.5074,
      },
    },
  },
});

export const getSpeciesDataObjectMock = (): TDataObjectOrNull => ({
  id: "abc",
  objectType: "species",
  attributes: {
    scientific_name: "Abax parallelepipedus",
    common_name: "Ground beetle",
    count: 42,
    location: { city: "London", coordinates: { lat: 51.5 } },
  },
});
