/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from "../services/http/httpClient";
import { Zone } from "../board";


interface Props {
  totalSize: number,
  endpoint: string,
  baseUrl?: string,
  filter?: Zone
}

function RemoteRowCounter(props: Props) {
  const { totalSize, endpoint, baseUrl, filter } = props;
  const [count, setCount] = useState<number | string>('');

  const fetchRowTotal = () => {
    httpClient()
    .get("/" + endpoint + ":count", {
      params: {
        filter: filter,
      },
      baseURL: baseUrl,
    })
    .then((res: any) => {
      setCount(res.data.meta.total);
    })
  }
  
  useEffect(() => {
    console.log('fitler');
    setCount('');
    if (totalSize === 10000) {
      fetchRowTotal();
    } else {
      setCount(totalSize);
    }
  }, [filter]);

  const addTotalText = () => {
    if (!count) return;
    if (count === 1) {
      return "1 Row";
    // add a plus for elastic search default (results cap at 10,000)
    } else if (count === 10000) {
      return "10,000+ Rows";
    }
    return count.toLocaleString() + " Rows";
  }

  return (
    <span className='tol-total'>
      {addTotalText()}
    </span>
  );
}

export default RemoteRowCounter;
