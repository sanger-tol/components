/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect} from "react";
import { API_METHODS, IRemoteTarget, ICountProps } from "..";

interface Props extends IRemoteTarget {
  totalSize: number;
  filter?: object;
  loading: boolean;
}

type TRowCounterProps = ICountProps & Props; 

export function RowCounter(
  { setCount, count, dataSource, objectType, totalSize, filter, loading }: RowCounterProps
) {

  const fetchRowTotal = () => {
    dataSource
      .custom({
        method: API_METHODS.GET,
        resource: `${objectType}:count`,
        params: {
          filter: filter,
        },
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

  return <span>{addTotalText(count)}</span>;
}
