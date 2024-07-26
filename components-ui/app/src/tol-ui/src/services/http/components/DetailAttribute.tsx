/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Loader } from '../../../index';
import { useState } from 'react';


interface Props {
  id: string,
  endpoint: string,
  baseUrl?: string,
  attribute: string
}

function DetailAttribute(props: Props) {
  //const { id, endpoint, baseUrl, attribute } = props;
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  /*
  Detail.fetchDetail(
    id,
    endpoint,
    baseUrl
  ).then((res: any) => {
    if ('data' in res
      && 'data' in res.data
      && 'attributes' in res.data.data
    ) {
      if (attribute === 'id') {
        setText(res.data.data.id);
      } else {
        setText(res.data.data.attributes[attribute]);
      }
    } else {
      setText('');
    }
    setLoading(false);
  });
  */

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
