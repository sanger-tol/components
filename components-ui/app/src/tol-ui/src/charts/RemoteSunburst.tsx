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
} from "./Utils";
import Sunburst from "./Sunburst";
import Placeholder from "../general/Placeholder";
import { useEffectUpdate } from "../hooks/useEffectUpdate";
import { isEmptyObject, normaliseCaps } from "../general/Utils";
import {
  generateFilter,
  addSubFilter,
  filterHasUpdated,
  resetFiltersBelow
} from "../filtering/Utils";


interface Props {
  id: string,
  endpoint: string,
  title: string,
  sliceBy: string[],
  height?: any,
  baseUrl?: string,
  legendPosition?: string,
  noLegend?: boolean,
  noLabel?: boolean,
  noMini?: boolean,
  zone?: object,
  setZone?: any
}

function RemoteSunburst(props: Props) {
  const {
    id,
    endpoint,
    sliceBy,
    baseUrl,
    noMini,
    zone,
    setZone
  } = props;
  const subId = 'tol-sub-sunburst-' + id;
  const height = (props.height !== undefined) ? props.height : "100%";
  const [datasets, setDatasets] = useState({});
  const [subDatasets, setSubDatasets] = useState({});
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sliceData, setSliceData] = useState({});
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

  // for sub sunburst updates
  useEffectUpdate(() => {
    const localFilter = generateFilterFromSunburstClick(sliceData);
    // this also resets components below
    addSubFilter({
      id: id,
      subId: subId,
      filter: localFilter,
      zone: zone!
    });
    setZone({...zone});
    // clear sub sunburst
    if (isEmptyObject(sliceData)) {
      setSubDatasets({});
    // go deeper into the sunburst if not outer ring
    } else if (sliceData["datasetIndex"] !== 0) {
      setSubLoading(true);
      const aggs = createAggsViaSliceBy(
        endpoint,
        removeSliceBySingles(sliceBy, sliceData["depth"])
      );
      httpClient().post('/' + endpoint + ":aggregations", aggs, {
        baseURL: baseUrl,
        params: {
          filter: generateFilter(subId, zone!)
        }
      }).then((res: any) => {
        const aggs = res.data.meta.aggregations;
        setErrorMessage('');
        setWarningMessage(isChartDataEmpty(aggs));
        const data = aggsToSunburstData(aggs, sliceBy);
        setSubDatasets(data);
        setSubLoading(false);
      }).catch((error: any) => {
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

  const miniActive = noMini === true ? false : !isEmptyObject(subDatasets);
  const setter = (setZone === undefined) ? undefined : setSliceData;

  return (
    <div style={{height: height}}>
      <Sunburst
        {...props}
        id={miniActive ? subId : id}
        height={miniActive ? height*0.25 : height}
        width={miniActive ? height*0.5 : undefined}
        datasets={datasets}
        downloadName={normaliseCaps(endpoint)}
        noLegend={miniActive}
        setSliceData={setter}
      />
      {miniActive && 
        <div>
          {subLoading ?
            <Placeholder loader clear height={height*0.75} />
            :
            <Sunburst
              {...props}
              title={normaliseCaps(sliceData["clickKey"])}
              height={height*0.75}
              datasets={subDatasets}
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
