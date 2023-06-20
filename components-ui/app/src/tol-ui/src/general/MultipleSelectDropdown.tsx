/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { Checkbox, CheckPicker as RSCheckPicker } from 'rsuite';

interface Props {
    data: string[]
    placeholder?: string
    value: string[]
    setValue:React.Dispatch<React.SetStateAction<string[]>>
}

const MultipleSelectDropdown = (props: Props) => {
    const {data, placeholder, value, setValue} = props
    const formattedData = data.map(item => 
        ({ label: item, value: item })
    )

    const allValue = formattedData.map(item => item.value);

    const handleCheckAll = () => {
        setValue(value.length === allValue.length ? [] : allValue);
    };
  
    return (
        <div className='tol-input'>
          <RSCheckPicker
            value={value}
            onChange={setValue}
            data={formattedData}
            placeholder={placeholder}
            renderExtraFooter={() => (
                <div>
                  <Checkbox
                    indeterminate={value.length > 0 && value.length < allValue.length}
                    checked={value.length === allValue.length}
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

export default MultipleSelectDropdown;