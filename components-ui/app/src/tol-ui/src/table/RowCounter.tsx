/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from "../services/http/httpClient";

interface Props {
  totalSize: number;
  endpoint: string;
  baseUrl?: string;
  filter?: object;
  loading: boolean;
}

function RowCounter(props: Props) {
  const { totalSize, endpoint, baseUrl, filter, loading } = props;
  const [count, setCount] = useState<number | null>(null);

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
      });
  };

  useEffect(() => {
    if (!loading) {
      if (totalSize === 10000) {
        fetchRowTotal();
      } else {
        setCount(totalSize);
      }
    }
  }, [loading]);

  const addTotalText = (total: number) => {
    if (total === 1) {
      return "1 Row";
      // add a plus for elastic search default (results cap at 10,000)
    } else if (total === 10000) {
      return "10,000+ Rows";
    }
    return total.toLocaleString() + " Rows";
  };

  if (count === null) return <></>;

  return addTotalText(count);
}

export default RowCounter;
