/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { httpClient } from '../services/http/httpClient';


interface Props {
    endpoint: string,
    baseUrl: string,
    defaultFilter?: object,
    title: string,
    filter?: object
  }

function CountWidget(props: Props){
  const [count, setCount] = useState(0);
  const { endpoint, baseUrl, defaultFilter, title, filter } = props;
  const filters = Object.assign({}, filter, defaultFilter);
  httpClient().get('/' + endpoint + ":count", {
    baseURL: baseUrl,
    params: {
      filter: filters
    }
  })
    .then((res: any) => {
      const total = res.data.meta.total;
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