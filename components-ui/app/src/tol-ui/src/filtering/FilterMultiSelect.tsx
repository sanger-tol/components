/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { Filter } from './Filter';
import { setFilter, filterListener } from './Utils';
import { MultipleSelect } from '../forms';
import { httpClient } from '../services';
import { PopUpMessage } from '../general';


function FilterMultiSelect(props: Filter) {
  const { attribute, componentId, rename, zone, setZone, endpoint, baseUrl } = props;
  const [data, setData] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
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
    setDisabled: setDisabled,
    emptyValue: [],
    zoneToValue: (filterValue: any) => {
      return filterValue;
    }
  }, [zone]);

  const onFilter = (input: string[]) => {
    setValues(input);
    clearTimeout(timeoutValue!);
    setTimeoutValue(setTimeout(() => {
      setValues(input);
      setFilter({
        operator: operator,
        value: input,
        negate: false,
        attribute: attribute,
        componentId: componentId,
        zone: zone,
        valueExists: input.length !== 0,
      });
      setZone({...zone});
    }, 1000));
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
    <span>
      <PopUpMessage
        type='danger'
        message={errorMessage}
        setMessage={setErrorMessage}
      />
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
    </span>
  );
}

export default FilterMultiSelect;
