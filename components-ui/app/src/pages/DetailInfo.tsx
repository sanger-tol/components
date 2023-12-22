/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CentreContents, RemoteObjectDetail, env } from '../tol-ui/src';
import { useParams } from 'react-router-dom'
import { useState } from 'react';

function DetailInfo() {
    const { id } = useParams()
    const [filter] = useState({ contains: { uid: id } })

    // TODO use widgets to display object detail and tables here
    return (
        <div>
            <CentreContents>
            <h2 className='mt-5'>Remote Object Detail</h2>
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
            />
            </CentreContents>
            </div>
    );
}

export default DetailInfo;