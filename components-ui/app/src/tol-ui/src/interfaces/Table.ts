/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch } from 'react';


export interface IProgressThreshold {
  setCurrent: Dispatch<React.SetStateAction<number>>;
  setPercentageComplete: Dispatch<React.SetStateAction<number>>;
  setSecondsElapsed: Dispatch<React.SetStateAction<number>>;
}