/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { SelectPicker } from 'rsuite';


interface Props {
    data: string[]
    placeholder?: string
    value: string
    setValue: any
  }
  
const SingleSelect = (props: Props) => {
  const {data, placeholder, setValue, value} = props;
  
  const convertedData = data.map(
    item => ({ label: item, value: item })
  );

  return (
    <SelectPicker
      data={convertedData}
      searchable={false}
      value={value}
      onChange={setValue}
      placeholder={placeholder}
    />
  );
};

export default SingleSelect;
