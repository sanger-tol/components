/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { formatDate, normaliseCaps } from './Utils'


const updateContents = (contents: object) => {
    for (const [key, value] of Object.entries(contents)) {
      // remove or format some content
      if (typeof value === 'string' && value.includes('GMT')) {
        contents[key] = formatDate(value)
      }
    }
    return contents
  }

export interface Props {
    data: object
    // fields?: FieldMetaData
}

const ObjectDetail = (props: Props) => {
    const { data } = props
    return (
        <div className='tol-object-detail'>
            <h2 className='mb-2'>Info</h2>
            {Object.entries(updateContents(data)).map(([key, value]) =>
            <p key={key}>
                <strong>{normaliseCaps(key)}:</strong> {value}
            </p>)}
        </div>
        )
}

export default ObjectDetail;
