/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TDataObjectOrNull,
  IGetOne,
  IGetByIds,
} from "../.."


/* Abstract class for fetching detailed data objects */
export abstract class DetailGetter {
  /* Fetches multiple data objects by their IDs */
  public async getByIds({
    objectType,
    ids,
  }: IGetByIds): Promise<TDataObjectOrNull[]> {
    const promiseBulk = ids.map((id) => this.getOne({ objectType, id }));
    return await Promise.all(promiseBulk);
  }
  
  public abstract getOne({ }: IGetOne): Promise<TDataObjectOrNull>;

}