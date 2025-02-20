/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { httpClient } from "../services/http/httpClient";
import { LoadingContent } from "../index";

interface Props {
  endpoint: string;
  baseUrl?: string;
  loadingMessage?: string;
  response: any;
  setResponse: any;
}

function RemoteGet(props: Props) {
  const { endpoint, baseUrl, loadingMessage, response, setResponse } = props;

  useEffect(() => {
    httpClient()
      .get("/" + endpoint, {
        baseURL: baseUrl,
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
