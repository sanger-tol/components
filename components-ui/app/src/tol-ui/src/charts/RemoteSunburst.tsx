/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from "react";
import { httpClient } from '../services/http/httpClient';
import {
  aggsToSunburstData,
  createAggsViaSliceBy,
  isChartDataEmpty,
  generateFilterFromSunburstClick,
  removeSliceBySingles
} from "./ChartUtils";
import Sunburst from "./Sunburst";
import Placeholder from "../general/Placeholder";
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { isEmptyObject, normaliseCaps } from "../general/Utils";


interface Props {
  endpoint: string,
  title?: string,
  sliceBy: string[],
  height: number,
  baseUrl?: string,
  legendPosition?: string,
  noLabel?: boolean,
  noMini?: boolean,

  // 'filter' is usually referred to as globalFilters when using combinedFilters
  filter?: object,
  setCombinedFilters?: Function, // eslint-disable-line
}

function RemoteSunburst(props: Props) {
  const {
    endpoint,
    sliceBy,
    baseUrl,
    height,
    legendPosition,
    noLabel,
    noMini,
    filter, 
    setCombinedFilters
  } = props;
  const [datasets, setDatasets] = useState({});
  const [subDatasets, setSubDatasets] = useState({});
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sliceData, setSliceData] = useState<object>({});
  const localFilter = generateFilterFromSunburstClick(sliceData);

  useEffect(() => {
    console.log('filter')
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

  // combine local and globalFilters
  useEffectUpdate(() => {
    async function combine() {
      if (setCombinedFilters !== undefined) {
        setCombinedFilters(Object.assign({}, filter, localFilter));
      }
    }
    combine();
  }, [sliceData]);

  // reset localFilters when globalFilters are updated
  useEffectUpdate(() => {
    async function resetCombined() {
      if (setCombinedFilters !== undefined) {
        setCombinedFilters(Object.assign({}, filter));
      }
    }
    resetCombined();
  }, [filter]);

  // for mini sunburst updates
  useEffectUpdate(() => {
    console.log('sliceData')
    setLoading(true);
    const aggs = createAggsViaSliceBy(
      endpoint,
      removeSliceBySingles(sliceBy, sliceData["depth"])
    );
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: Object.assign({}, filter, localFilter)
      }
    })
    .then((res: any) => {
      const aggs = res.data.meta.aggregations;
      setErrorMessage('');
      setWarningMessage(isChartDataEmpty(aggs));

      const data = aggsToSunburstData(aggs, sliceBy);
      setSubDatasets(data);
      setLoading(false);
    })
    .catch((error: any) => {
      setErrorMessage(error.message);
      console.error(error.message);
    });
  }, [sliceData]);

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

  //const selector = setCombinedFilters === undefined ? undefined : setSliceData
  //const miniSelector = 

  return (
    <div style={{height: height.toString() + 'px'}}>
      <Sunburst
        {...props}
        height={isEmptyObject(sliceData) ? height : height*0.3}
        width={isEmptyObject(sliceData) ? undefined : height*0.5}
        datasets={datasets}
        noLegend={!isEmptyObject(sliceData)}
        setSliceData={
          setCombinedFilters === undefined ? undefined : setSliceData
        }
      />
      {!noMini && !isEmptyObject(sliceData) &&
        <Sunburst
          title={normaliseCaps(sliceData["clickKey"])}
          datasets={subDatasets}
          height={height*0.7}
          legendPosition={legendPosition}
          noLabel={noLabel}
          setSliceData={
            setCombinedFilters === undefined ? undefined : setSliceData
          }
        />
      }
    </div>
  );
}

export default RemoteSunburst;
