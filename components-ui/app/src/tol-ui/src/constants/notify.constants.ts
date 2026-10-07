/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env } from "../variables/config";
import type { TTolApp } from "..";

export const BUS_MESSAGE_OBJECT_TYPE = "bus_message";
export const MAX_EMAILS_ALLOWED = 50;
export const APP_NAME = env.APP_NAME as TTolApp;