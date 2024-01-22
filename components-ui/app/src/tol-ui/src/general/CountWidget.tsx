/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { httpClient } from '../services/http/httpClient';


interface Props {
    endpoint: string,
    baseUrl: string,
    defaultFilter: object,
    title: string,
    globalFilters?: object
  }

function CountWidget(props: Props){
  const [count, setCount] = useState(0);
  const { endpoint, baseUrl, defaultFilter, title, globalFilters } = props;
  const filters = Object.assign({}, globalFilters, defaultFilter)
  httpClient().get('/' + endpoint + ":count", {
    baseURL: baseUrl,
    params: {
      filter: filters
    }
  })
    .then((res: any) => {
      const total = res.data.meta.total;
      console.log(total);
      setCount(total);
    });

  return(
    <div className="count-widget-container">
      <h5>{title}</h5>
      <h1>{count}</h1>
    </div>
  );
}

export default CountWidget;