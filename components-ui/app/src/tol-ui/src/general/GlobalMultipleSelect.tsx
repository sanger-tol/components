/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useEffect, useState } from 'react';
import { Checkbox, CheckPicker as RSCheckPicker } from 'rsuite';
import { isPropDefined } from './Utils';

interface Props {
  block?: boolean
  data: string[]
  name: string
  globalFilters: {
    in_list: { [key: string]: string[] };
  };
  setGlobalFilters:React.Dispatch<React.SetStateAction<object>>
}

const GlobalMultipleSelect = (props: Props) => {
  const [value, setValue] = useState<any[]>([])
    const {data, name, globalFilters, setGlobalFilters} = props
    const block = isPropDefined(props.block)

    
    useEffect(() => {
      globalFilters.in_list[name] = []
    },[])

    const formattedData = data.map(item => 
      ({ label: item, value: item })
    )

    const allValue = formattedData.map(item => item.value);
      
    const handleOnChange = (event) => {
      setValue(event)
      globalFilters.in_list[name] = event
      setGlobalFilters({ ...globalFilters})
    }

    const handleCheckAll = () => {
      if (globalFilters.in_list[name]) {
        if (globalFilters.in_list[name].length === allValue.length) {
          globalFilters.in_list[name] = [];
          setValue([])
        } else {
          globalFilters.in_list[name] = allValue;
          setValue(allValue)
        }
      } else {
        globalFilters.in_list[name] = allValue;
        setValue(allValue)
      }
      
      setGlobalFilters({ ...globalFilters });
    };

    return (
      <div className='tol-input'>
        <RSCheckPicker
          block={block}
          value={value}
          onChange={handleOnChange}
          data={formattedData}
          placeholder={name}
          renderExtraFooter={() => (
            <div>
              <Checkbox
                indeterminate={globalFilters.in_list[name] && (globalFilters.in_list[name].length > 0 && globalFilters.in_list[name].length < allValue.length)}
                checked={globalFilters.in_list[name] && globalFilters.in_list[name].length === allValue.length}
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