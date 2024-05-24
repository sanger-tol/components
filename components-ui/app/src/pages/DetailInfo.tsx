/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Header, ObjectDetail, RemoteGet, Widgets, env, formatDate } from '../tol-ui/src';
import { useParams } from 'react-router-dom';
import { useState } from 'react';


function DetailInfo() {
  const { id } = useParams<({id: string})>();
  const [response, setResponse] = useState();

  if (response === null) {
    return (
      <Header
        title="Species not found."
        pageEmpty
      />
    );
  }

  if (response === undefined) {
    return (
      <RemoteGet
        endpoint={'species/' + id}
        baseUrl={env.TOL_DATA}
        loadingMessage='Loading species...'
        response={response}
        setResponse={setResponse}
      />
    );
  } else {
    const attributes = response!['data']['data']['attributes'];
    const detail = (
      <ObjectDetail
        data={{
          "Taxonomy ID": attributes['uid'],
          "Common Name": attributes['sts_common_name'],
          "Family": attributes['sts_family'],
          "Order Group": attributes['sts_order_group'],
          "ToLID Prefix": attributes['sts_prefix'],
          "Pacbio Submission Date": formatDate(attributes['sts_pacbio_submitted_date'])
        }}
      />
    );

    const components = [
      {
        component: detail,
        type: 'full'
      }
    ];

    return (
      <Widgets
        components={components}
      />
    );
  }
}

export default DetailInfo;
