/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  TDataObjectOrNull,
  IGetOne,
  IGetByIds,
} from "../.."


/** Reusable bulk lookup using a data source's single-object lookup */
export class DetailGetter {
  constructor(private readonly getOne: (args: IGetOne) => Promise<TDataObjectOrNull>) {}

  /* Fetches multiple data objects by their IDs */
  public async getByIds({
    objectType,
    ids,
  }: IGetByIds): Promise<TDataObjectOrNull[]> {
    const promiseBulk = ids.map((id) => this.getOne({ objectType, id }));
    return await Promise.all(promiseBulk);
  }
}