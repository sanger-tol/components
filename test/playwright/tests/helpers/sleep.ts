// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

export async function sleep(ms: number) {
    /**
     * Avoid sleeps at all costs, this is a last resort!
     */
    return new Promise(resolve => setTimeout(resolve, ms));
}
