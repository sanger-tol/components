/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { LoadingContent, TsDataSource } from "../index";
import { API_METHODS } from "../constants";

interface Props {
  resource: string;
  dataSource: TsDataSource;
  loadingMessage?: string;
  response: any;
  setResponse: any;
}

function RemoteGet(props: Props) {
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

export default RemoteGet;
