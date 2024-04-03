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
import { mergeFilters } from "../general/Filter";


interface Props {
  id: string,
  endpoint: string,
  title: string,
  sliceBy: string[],
  height?: any,
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
    id,
    endpoint,
    sliceBy,
    baseUrl,
    legendPosition,
    noLabel,
    noMini,
    filter, 
    setCombinedFilters
  } = props;
  const height = (props.height !== undefined) ? props.height : "100%";
  const [datasets, setDatasets] = useState({});
  const [miniDatasets, setMiniDatasets] = useState({});
  const [loading, setLoading] = useState(true);
  const [miniLoading, setMiniLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sliceData, setSliceData] = useState<object>({});
  const localFilter = generateFilterFromSunburstClick(sliceData);

  useEffect(() => {
    setLoading(true);
    const aggs = createAggsViaSliceBy(endpoint, sliceBy);
    httpClient().post('/' + endpoint + ":aggregations", aggs, {
      baseURL: baseUrl,
      params: {
        filter: filter
      }
    }).then((res: any) => {
      const aggs = res.data.meta.aggregations;
      setErrorMessage('');
      setWarningMessage(isChartDataEmpty(aggs));

      const data = aggsToSunburstData(aggs, sliceBy);
      setDatasets(data);
      setLoading(false);
    }).catch((error: any) => {
      setErrorMessage(error.message);
      console.error(error.message);
    });
  }, [filter]);

  // combine local and globalFilters
  useEffectUpdate(() => {
    if (setCombinedFilters !== undefined) {
      setCombinedFilters(
        mergeFilters(filter, localFilter)
      );
    }
  }, [sliceData]);

  // reset localFilters when globalFilters are updated
  useEffectUpdate(() => {
    if (setCombinedFilters !== undefined) {
      setCombinedFilters(Object.assign({}, filter));
      setMiniDatasets({});
    }
  }, [filter]);

  // for mini sunburst updates
  useEffectUpdate(() => {
    // clear mini sunburst
    if (isEmptyObject(sliceData)) {
      setMiniDatasets({});
    // go deeper into the sunburst if not outer ring
    } else if (sliceData["datasetIndex"] !== 0) {
      setMiniLoading(true);
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
          setMiniDatasets(data);
          setMiniLoading(false);
        })
        .catch((error: any) => {
          setErrorMessage(error.message);
          console.error(error.message);
        });
    }
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

  const miniActive = noMini === true ? false : !isEmptyObject(miniDatasets);
  const setter = (setCombinedFilters === undefined) ? undefined : setSliceData;

  return (
    <div style={{height: height}}>
      <Sunburst
        {...props}
        id={miniActive ? id + '-mini' : id}
        height={miniActive ? height*0.25 : height}
        width={miniActive ? height*0.5 : undefined}
        datasets={datasets}
        downloadName={normaliseCaps(endpoint)}
        noLegend={miniActive}
        setSliceData={setter}
      />
      {miniActive && 
        <div>
          {miniLoading ?
            <Placeholder loader clear height={height*0.75} />
            :
            <Sunburst
              id={id}
              title={''}
              height={height*0.75}
              datasets={miniDatasets}
              legendPosition={legendPosition}
              downloadName={
                normaliseCaps(endpoint) + " - " + normaliseCaps(sliceData["clickKey"])
              }
              noLabel={noLabel}
              noRefresh
              setSliceData={setter}
            />
          }
        </div>
      }
    </div>
  );
}

export default RemoteSunburst;
