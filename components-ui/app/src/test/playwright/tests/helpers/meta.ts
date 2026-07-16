// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

export const isInHeadlessMode = !!(process.env.CI || process.env.HEADLESS);
