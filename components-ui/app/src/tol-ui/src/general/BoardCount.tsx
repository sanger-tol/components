/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteCount } from '../'
import { useState } from 'react';

interface Props {
  id: string;
  title: string;
  objectType: string;
  baseUrl?: string;
  zone?: object;
  setZone?: any;
  config: any;
}

function BoardCount(props: Props) {
  const { id, objectType } = props;
  const [config, setConfig] = useState<any>(props.config);

  return (
    <div>
      <RemoteCount
        id={id}
        title={props.title}
        endpoint={objectType}
        baseUrl={props.baseUrl}
        zone={props.zone}
        setZone={props.setZone}
      />
    </div>
  );
}

export default BoardCount;
