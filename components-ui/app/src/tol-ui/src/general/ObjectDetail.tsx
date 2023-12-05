/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import Divider from './Divider';

export interface Props {
    data: object
}

const ObjectDetail = (props: Props) => {
    const { data } = props

    return (
        <div className='tol-object-detail'>
            <h2>Info</h2>
            <Divider/>
            <p>This is a test text.</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
        )
}


export default ObjectDetail;
