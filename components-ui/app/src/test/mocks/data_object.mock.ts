/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DataObject } from "../../tol-ui/src/datasource";


export const mockDataObject = () => new DataObject(
  'objId',
  'sample',
  {
    'name': 'sampleName',
  },
  {
    'specimen': specimenObjMock(),
  }
);

const specimenObjMock = () => new DataObject(
  'nestedObjId',
  'specimen',
  {
    'name': 'specimenName',
  },
  {
    'species': speciesObjMock(),
  }
);

const speciesObjMock = () => new DataObject(
  'evenMoreNestedObj',
  'species',
  {
    'name': 'speciesName',
  }
);
