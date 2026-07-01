/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource } from "../../tol-ui/src";
import type {
  IClientMethods,
  ICustom,
} from "../../tol-ui/src";

const PLACEHOLDER_CLIENT_METHOD = () => Promise.resolve({ data: {} });

export class MockDataSource extends TsDataSource {
  /**
   * Keeps track of every request that was made via  this object since it was instantiated.
   * Each request is in the format `ICustom`, as it's captured just before `.custom` is called.
   */
  public capturedRequests: ICustom[];

  constructor({ onGet, onPost, onPut, onPatch, onDelete }: {
    onGet?: IClientMethods["get"],
    onPost?: IClientMethods["post"],
    onPut?: IClientMethods["put"],
    onPatch?: IClientMethods["patch"],
    onDelete?: IClientMethods["delete"],
  }) {
    const client = () => ({
      get: onGet ?? PLACEHOLDER_CLIENT_METHOD,
      post: onPost ?? PLACEHOLDER_CLIENT_METHOD,
      put: onPut ?? PLACEHOLDER_CLIENT_METHOD,
      patch: onPatch ?? PLACEHOLDER_CLIENT_METHOD,
      delete: onDelete ?? PLACEHOLDER_CLIENT_METHOD,
    });
  
    super({ client });
    this.capturedRequests = [];
  }

  public override async custom(request: ICustom) {
    this.capturedRequests.push(request);
    return await super.custom(request);
  }
}
