/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Network } from '@capacitor/network';

/**
 * Function that checks if the device is offline.
 * @returns A promise that resolves to `true` if the device is offline, `false` otherwise.
 */
export async function isOffline(): Promise<boolean> {
    const { connected } = await Network.getStatus();
    return !connected;
}