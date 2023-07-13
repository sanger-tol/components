/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { AutoComplete as RSAutoComplete } from 'rsuite';


interface Props {
  data: string[]
  value: string
  onChange?: React.Dispatch<React.SetStateAction<any>>
}

function AutoComplete(props: Props) {
  const { data, value, onChange } = props;

  return (
    <div>
      <RSAutoComplete data={data} value={value} onChange={onChange} />
    </div>
  );
}

export default AutoComplete;
