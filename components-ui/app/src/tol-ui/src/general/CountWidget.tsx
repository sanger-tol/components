/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { httpClient } from '../services/http/httpClient';


interface Props {
    endpoint: string,
    baseUrl: string,
    filter: object,
    title: string
  }

function CountWidget(props: Props){
  const [count, setCount] = useState(0);
  const { endpoint, baseUrl, filter, title } = props;
  httpClient().get('/' + endpoint + ":count", {
    baseURL: baseUrl,
    params: {
      filter: filter
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