/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { SelectPicker } from 'rsuite';


interface Props {
  data: string[]
  placeholder?: string
  value: string
  setValue: any,
  block?: boolean
}
  
const SingleSelect = (props: Props) => {
  const {data, placeholder, setValue, value, block} = props;
  
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
      block={block}
    />
  );
};

export default SingleSelect;
