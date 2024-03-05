/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from '../services/http/httpClient';
import { numberWithSpaces } from "./Utils";
import Placeholder from "./Placeholder";


interface Props {
  title: string,
  endpoint: string,
  baseUrl?: string,
  filter?: object
}

function RemoteCount(props: Props){
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { endpoint, baseUrl, title, filter } = props;

  useEffect(() => {
    httpClient().get('/' + endpoint + ":count", {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    }).then((res: any) => {
      const total = res.data.meta.total;
      setCount(total);
      setLoading(false);
    }).catch((error: any) => {
      setLoading(false);
      setError(error.message);
      console.error(error.message);
    });
  }, []);

  if (error !== ''){
    return (
      <Placeholder
        errorMessage={error}
      />
    );
  }
    
  
  if (loading) {
    return <Placeholder loader />;
  }


  return (
    <div className="tol-count">
      <p>{title}</p>
      <h1 className="count">{numberWithSpaces(count)}</h1>
      <div className="faded">
        <h1>{count}</h1>
      </div>
    </div>
  );
}

export default RemoteCount;
