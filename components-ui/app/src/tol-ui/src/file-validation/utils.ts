/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface Step {
    id: string;
    stepName: string;
    errors?: string[];
}

export function determineStepHasErrors(step: Step): boolean {
  return (!step.errors || step.errors.length === 0) ? false : true;
}