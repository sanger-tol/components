/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Checkbox, CheckPicker as RSCheckPicker } from 'rsuite';
import { isPropDefined } from '../general/Utils';


interface Props {
  block?: boolean
  data: string[]
  placeholder?: string
  value: string[]
  setValue: any
}

const MultipleSelect = (props: Props) => {
  const {data, placeholder, value, setValue} = props;
  const block = isPropDefined(props.block);

  const formattedData = data.map(item => 
    ({ label: item, value: item })
  );

  const allValues = formattedData.map(item => item.value);

  const handleCheckAll = () => {
    setValue(value.length === allValues.length ? [] : allValues);
  };
  
  return (
    <RSCheckPicker
      block={block}
      value={value}
      onChange={setValue}
      data={formattedData}
      placeholder={placeholder}
      renderExtraFooter={() => (
        <div>
          <Checkbox
            indeterminate={value.length > 0 && value.length < allValues.length}
            checked={value.length === allValues.length}
            onChange={handleCheckAll}
          >
            Select all
          </Checkbox>
        </div>
      )}
    />
  );
};

export default MultipleSelect;