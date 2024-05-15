/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { httpClient } from '../services/http/httpClient';
import { numberWithSpaces } from "./Utils";
import Placeholder from "./Placeholder";
import {
  generateFilter,
  filterHasUpdated,
  resetFiltersBelow
} from "../filtering/Utils";
import { useEffectUpdate } from "../hooks";


interface Props {
  id: string,
  title: string,
  endpoint: string,
  baseUrl?: string,
  zone?: object
  setZone?: any
}

function RemoteCount(props: Props) {
  const { id, endpoint, baseUrl, title, zone, setZone } = props;
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<object|undefined>({});

  useEffect(() => {
    const compoundedFilter = generateFilter(id, zone);
    // will trigger [filter] useEffect if update has occured
    if (filterHasUpdated(setFilter, filter, compoundedFilter)) {
      resetFiltersBelow({id: id, zone: zone!});
      setZone({...zone});
    }
  }, [zone]);

  useEffectUpdate(() => {
    setLoading(true);
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
  }, [filter]);


  if (error !== '') {
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
    <div id={id} className="tol-count">
      <p>{title}</p>
      <h1 className="count">{numberWithSpaces(count)}</h1>
      <div className="faded">
        <h1>{count}</h1>
      </div>
    </div>
  );
}

export default RemoteCount;
