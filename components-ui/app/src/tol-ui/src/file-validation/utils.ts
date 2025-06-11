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
  if (!step.errors || step.errors.length === 0) {
    return false;
  }
  return true;
}