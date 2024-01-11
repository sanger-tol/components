/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from '../services/http/httpClient';
import { aggsToSunburstData, createAggsViaSliceBy, isChartDataEmpty } from "./ChartUtils";
import Sunburst from "./Sunburst";
import Placeholder from "../general/Placeholder";


interface Props {
  endpoint: string,
  title?: string,
  sliceBy: string[],
  filter?: object,
  height: number,
  baseUrl?: string,
  legendPosition?: string,
  noLabel?: boolean
}

function RemoteSunburst(props: Props) {
  const { endpoint, filter, sliceBy, baseUrl, height } = props;
  const [datasets, setDatasets] = useState({});
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    const aggs = createAggsViaSliceBy(endpoint, sliceBy);
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    })
      .then((res: any) => {
        const aggs = res.data.meta.aggregations;
        setErrorMessage('');
        setWarningMessage(isChartDataEmpty(aggs));

        const data = aggsToSunburstData(aggs, sliceBy);
        setDatasets(data);
        setLoading(false);
      })
      .catch((error: any) => {
        setErrorMessage(error.message);
        console.error(error.message);
      });
  }, [filter]);

  if (errorMessage !== ''){
    return (
      <Placeholder
        errorMessage={errorMessage}
        height={height}
      />
    );
  }

  if (warningMessage !== '') {
    return (
      <Placeholder
        warningMessage={warningMessage}
        height={height}
      />
    );
  }
  
  if (loading) {
    return <Placeholder pie height={height} />;
  }

  return (
    <Sunburst
      {...props}
      datasets={datasets}
    />
  );
}

export default RemoteSunburst;
