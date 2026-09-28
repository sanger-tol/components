/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Network } from '@capacitor/network';

export async function isOffline(): Promise<boolean> {
    const { connected } = await Network.getStatus();
    return !connected;
}