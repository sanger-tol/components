/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import {
  LoadingContent,
  TsDataSource,
  API_METHODS,
} from "..";


export interface PRemoteGet {
  resource: string;
  dataSource: TsDataSource;
  loadingMessage?: string;
  response: any;
  setResponse: any;
}

export function RemoteGet(props: PRemoteGet) {
  const { resource, dataSource, loadingMessage, response, setResponse } = props;

  useEffect(() => {
    dataSource
      .custom({
        method: API_METHODS.GET,
        resource,
      })
      .then((res: any) => {
        setResponse(res);
      })
      .catch((error: any) => {
        setResponse(null);
        console.error(error.message);
      });
  }, []);

  if (response === undefined) {
    return <LoadingContent text={loadingMessage} />;
  }

  return <></>;
}
