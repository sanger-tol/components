/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { API_METHODS, IRemoteTarget } from "..";

interface Props extends IRemoteTarget {
  totalSize: number;
  setTotalSize: (totalSize: number) => void;
  filter?: object;
  loading: boolean;
}

export function RowCounter(props: Props) {
  let {
    totalSize,
    setTotalSize,
    dataSource,
    objectType,
    filter,
    loading,
  } = props;

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
        setTotalSize(res.data.meta.total);
      });
  };

  useEffect(() => {
    if (!loading) {
      if (totalSize === 10000) {
        fetchRowTotal();
      } else {
        setTotalSize(totalSize);
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

  if (totalSize === null) return <></>;

  return <span>{addTotalText(totalSize)}</span>;
}
