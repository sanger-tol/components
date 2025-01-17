/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { Filter } from './Filter';
import { setFilter, filterListener } from './Utils';
import { MultipleSelect } from '../forms';
import { httpClient } from '../services';
import FilterToggle from './FilterToggle';
import { stopPropagation } from '../general/Utils';
import { PopUpMessage } from '../index';


function FilterMultiSelect(props: Filter) {
  const { attribute, componentId, rename, zone, setZone, endpoint, baseUrl } = props;
  const [data, setData] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [exists, setExists] = useState<boolean>(false);
  const [negate, setNegate] = useState<boolean>(false);
  const [timeoutValue, setTimeoutValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const operator = 'in_list';

  useEffect(() => {
    if (!fetched && values.length !== 0) {
      fetchValues();
    }
  }, [values]);

  useEffect(() => {
    errorMessage && PopUpMessage({message: errorMessage, type: 'error'});
  }, [errorMessage]);

  const fetchValues = () => {
    if (!fetched) {
      setLoading(true);
      const aggs = {aggs: {}};
      aggs["aggs"][attribute] = {"terms" : {"field" : `${attribute}.keyword`, "size": 500 }};
      httpClient().post('/' + endpoint + ':aggregations', aggs, {
        baseURL: baseUrl
      })
        .then((res: any) => {
          const aggValues = res.data.meta.aggregations[attribute].buckets;
          setData(aggValues.map(item => item.key));
          setLoading(false);
          setFetched(true);
          updateDropdownText('No results found');
        })
        .catch((error: any) => {
          setErrorMessage(
            "Error fetching unique values for " + attribute + " in " +
            endpoint + ". " + error.message + "."
          );
          console.error(error.message);
          setLoading(false);
          setFetched(true);
          updateDropdownText('Error fetching values');
        });
    }
  };

  filterListener({
    attribute: attribute,
    componentId: componentId,
    operators: [operator],
    zone: zone,
    setValue: setValues,
    setExists: setExists,
    setNegate: setNegate,
    setDisabled: setDisabled,
    emptyValue: [],
    zoneToValue: (filterValue: any) => {
      return filterValue;
    }
  }, [zone]);

  const onFilter = (input: string[]) => {
    setValues(input);
    const delay = (input.length === 0) ? 0 : 800;
    clearTimeout(timeoutValue!);
    setTimeoutValue(setTimeout(() => {
      setFilter({
        operator: operator,
        value: input,
        negate: negate,
        attribute: attribute,
        componentId: componentId,
        zone: zone,
        valueExists: input.length !== 0,
      });
      setZone({...zone});
    }, delay));
  };
  
  const onExists = (ex: boolean) => {
    setExists(!ex);
    setValues([]);
    setFilter({
      operator: 'exists',
      negate: negate,
      exists: !ex,
      attribute: attribute,
      componentId: componentId,
      zone: zone
    });
    setZone({...zone});
  };

  const onNegate = (ng: boolean) => {
    setNegate(!ng);
    setFilter({
      operator: (exists) ? 'exists' : operator,
      value: values,
      negate: !ng,
      exists: exists,
      attribute: attribute,
      componentId: componentId,
      zone: zone,
      valueExists: values.length !== 0
    });
    setZone({...zone});
  };

  const updateDropdownText = (text: string) => {
    const div = document.querySelector('.rs-picker-none');
    if (div) div.innerHTML = text;
  };

  const setDropdownText = () => {
    if (!fetched) updateDropdownText('Loading values...');
    else if (errorMessage !== '') updateDropdownText('Error fetching values');
  };

  return (
    <div className="tol-multi-filter" onClick={ stopPropagation }>
      <MultipleSelect
        block
        data={data}
        placeholder={rename}
        disabled={disabled}
        value={values}
        setValue={onFilter}
        loading={loading}
        onEntering={() => setDropdownText()}
        onClick={(e) => {
          e.stopPropagation();
          fetchValues();
        }}
      />
      <FilterToggle
        negate={negate}
        onNegate={onNegate}
        exists={exists}
        onExists={onExists}
        disabled={disabled}
      />
    </div>
  );
}

export default FilterMultiSelect;
