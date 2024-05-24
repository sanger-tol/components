/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from 'react';
import { httpClient } from '../services/http/httpClient';
import { Loader } from '../index';

interface Props {
  endpoint: string,
  baseUrl?: string,
  loadingMessage?: string,
  response: any,
  setResponse: Function // eslint-disable-line
}

function RemoteGet(props: Props) {
  const { endpoint, baseUrl, loadingMessage, response, setResponse } = props;

  useEffect(() => {
    httpClient().get('/' + endpoint, {
      baseURL: baseUrl
    })
      .then((res: any) => {
        setResponse(res);
      }).catch((error: any) => {
        setResponse(null);
        console.error(error.message);
      });
  }, []);

  if (response === undefined) {
    return (
      <div className='fixed-full-page'>
        <div className='fixed-centered-loader'>
          <Loader />
        </div>
        <div className='fixed-centered-text'>
          {loadingMessage}
        </div>
      </div>
    );
  }

  return <></>;
}

export default RemoteGet;
