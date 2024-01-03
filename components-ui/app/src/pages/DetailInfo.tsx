/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteObjectDetail, Widgets, env } from '../tol-ui/src';
import { useParams, Redirect } from 'react-router-dom'
import { useState, useEffect } from 'react';

function DetailInfo() {
    let { id } = useParams<({id: string})>();
    const [filter] = useState({ contains: { uid: id } })
    const [data, setData] = useState()

    // useEffect(() => {
    //     if (data === undefined) {
    //         return <Redirect to="/page-not-found"/>
    //     }
    //     console.log(data)
    // }, [data])

    const objectInfo = (
        <RemoteObjectDetail
            endpoint='species'
            baseUrl={ env.TOL_DATA }
            filter={ filter }
            fields={{
                "uid": {
                    rename: "Taxonomy ID"
                },
                "sts_common_name": {
                    rename: "Common Name"
                },
                "sts_family": {
                    rename: "Family"
                },
                "sts_order_group": {
                },
                "sts_prefix": {
                    rename: "ToLID prefix"
                },
                "sts_pacbio_submitted_date": {
                    rename: "Pacbio Submission Date"
                }
            }}
        setData={setData}
        />
    )

    return (
        <div className='detail-info-display'>
            <Widgets
                title={data?.attributes.sts_scientific_name ?? 'Information'}
                components={[objectInfo]}
            />
        </div>
    );
}

export default DetailInfo;
