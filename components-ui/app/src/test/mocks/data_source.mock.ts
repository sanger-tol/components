/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TsDataSource } from "../../tol-ui/src";
import type {
  IClientMethods,
  ICustom,
} from "../../tol-ui/src";

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
      get: onGet ?? (() => {}),
      post: onPost ?? (() => {}),
      put: onPut ?? (() => {}),
      patch: onPatch ?? (() => {}),
      delete: onDelete ?? (() => {}),
    });
  
    super({ client });
    this.requests = [];
  }

  public override async custom(request: ICustom) {
    this.requests.push(request);
    super.custom(request);
  }
}
