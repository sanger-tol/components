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
  public requests: ICustom[];

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
    this.requests = [];
  }

  public override async custom(request: ICustom) {
    this.requests.push(request);
    return super.custom(request);
  }
}
