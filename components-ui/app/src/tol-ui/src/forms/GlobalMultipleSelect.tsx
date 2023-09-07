/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from 'react';
import { Checkbox, CheckPicker as RSCheckPicker } from 'rsuite';
import { isPropDefined, normaliseCaps } from '../general/Utils';


interface Props {
  block?: boolean,
  data: string[],
  name: string,
  globalFilters: {
    in_list: { [key: string]: string[] }
  }
  setGlobalFilters: React.Dispatch<React.SetStateAction<object>>
}

const GlobalMultipleSelect = (props: Props) => {
  const [value, setValue] = useState<any[]>([])
  const {data, name, globalFilters, setGlobalFilters} = props
  const block = isPropDefined(props.block)

  const formattedData = data.map(item => (
    { label: item, value: item }
  ))

  const allValues = formattedData.map(item => item.value);
    
  const handleOnChange = (filterValues: any) => {
    setValue(filterValues)
    // removes global filter if no values
    if (filterValues.length === 0) {
      delete globalFilters.in_list[name]
    } else {
      globalFilters.in_list[name] = filterValues
    }
    setGlobalFilters({...globalFilters})
  }

  const handleCheckAll = () => {
    if (globalFilters.in_list[name] && value.length === allValues.length) {
      delete globalFilters.in_list[name]
      setValue([])
    } else {
      // if no results found - make it so you cannot click
      if (allValues.length !== 0) {
        globalFilters.in_list[name] = allValues
        setValue(allValues)
      }
    }
    setGlobalFilters({...globalFilters})
  }

  const isChecked = () => {
    if (globalFilters.in_list[name]) {
      if (globalFilters.in_list[name].length === allValues.length) {
        return true
      }
    }
    return false
  }

  const isIndeterminate = () => {
    return globalFilters.in_list[name] && (
      globalFilters.in_list[name].length > 0 &&
      globalFilters.in_list[name].length < allValues.length
    )
  }  

  return (
    <div className='tol-input'>
      <RSCheckPicker
        block={block}
        value={value}
        onChange={handleOnChange}
        data={formattedData}
        placeholder={normaliseCaps(name)}
        renderExtraFooter={() => (
          <div>
            <Checkbox
              indeterminate={isIndeterminate()}
              checked={isChecked()}
              onChange={handleCheckAll}
            >
              Select all
            </Checkbox>
          </div>
        )}
      />
    </div>
  );
};

export default GlobalMultipleSelect;