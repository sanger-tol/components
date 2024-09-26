/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader, TsDataSource } from '../../../index';
import { useState } from 'react';


interface Props {
  id: string,
  endpoint: string,
  baseUrl?: string,
  attribute: string
}

function DetailAttribute(props: Props) {
  const { id, endpoint, baseUrl, attribute } = props;
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const ds = new TsDataSource({baseUrl: baseUrl});

  ds.getOne({
    objectType: endpoint,
    id: id
  }).then((res: any) => {
    setText(res[attribute] || '');
    setLoading(false);
  });

  return (
    <div className='loading-cell'>
      {loading ?
        <Loader
          size="sm"
          role="status"
          aria-hidden
        />
      :
        text
      }
    </div>
  );
}

export default DetailAttribute;
