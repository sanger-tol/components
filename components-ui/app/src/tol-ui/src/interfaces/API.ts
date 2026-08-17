/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { AxiosError, AxiosResponse } from "axios";
import { API_METHODS } from "..";

export type TApiMethod = (typeof API_METHODS)[keyof typeof API_METHODS];

export interface IApiResponse<T = unknown> extends AxiosResponse<T> {}

export interface IApiDataResponse<T = unknown>
  extends AxiosResponse<{ data?: T }> {}

export interface IErrorResponse<T = unknown> extends AxiosError<T> {}
