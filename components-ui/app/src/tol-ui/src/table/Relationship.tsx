/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { httpClient } from '../services/http/httpClient'
import HoverOverlay from '../general/HoverOverlay';
import FormatTooltip from '../general/FormatTooltip';
import { checkAndAutoConvertText,
         createCellRenderer } from './TableUtils'
import { normaliseCaps, isEmptyObject } from '../general/Utils'
import Placeholder from '../general/Placeholder';
import Status from '../general/Status'
import { timeout } from '../general/Utils';


export interface Props {
  initialEndpoint: string,
  relationships: string[],
  attributes: object,
  fieldMeta: object,
  baseUrl?: string,
}

function Relationship(props: Props) {
  const { initialEndpoint, relationships, attributes, fieldMeta, baseUrl } = props;

  const [text, setText] = useState<JSX.Element|string>(
    <Placeholder height={22}/>
  );
  const [contents, setContents] = useState({});
  const [tableData, setTableData] = useState(attributes);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleRelationshipLoading()
  }, [])

  const handleRelationshipLoading = async ()  => {
    let attribute = '';
    if (relationships.length !== 1) {
      attribute = relationships.pop()!
    }
    const relationshipTotal = relationships.length
    let endpoint = initialEndpoint

    for (let count = 0; count < relationshipTotal; count++) {
      await timeout(50)
      httpClient().get(endpoint, {baseURL: baseUrl})
      .then((res: any) => { // eslint-disable-line no-loop-func
        const data = res.data.data
        const currentAttributes = Object.assign({'id': data.id}, data.attributes)

        // if endpoint is the last relationship, set state
        if (count === relationshipTotal-1) {
          // if no requiredFields are set, there is no attribute
          let displayText = ''
          if (attribute === '') {
            displayText = normaliseCaps(data.type) + ': ' + data.id
          } else {
            displayText = currentAttributes[attribute]
          }

          // if defined attribute is incorrect, raise warning
          if (displayText === undefined) {
            setText('ERROR: See console')
            setContents({ ERROR: 'See console' })
            setTableData({ ERROR: 'See console' })
            throw Error (
              'Attribute \'' + attribute + '\' cannot be found in \'' + relationships[count] + '\''
            )
          }

          // please note that the object used is passed by reference
          tableData[relationships[count]] = currentAttributes

          setText(displayText)
          setContents(currentAttributes)

        } else {
          // assign detail endpoint where relationship title is
          const regex = /^\/([^]*)\/.*/
          const endpointObject = relationships[count+1].replace(regex, '$1')
          endpoint = data.relationships[endpointObject]['links']['related']
        }
      })
      .catch((error: any) => {
        if (error.response && error.response.status === 404) {
          setError('404')
        } else {
          setError(error)
        }
      })
    }
  }

  if (error === '404') {
    return <></>
  }
  
  if (error !== '') {
    return <Status status="danger" text="Network Error" />
  }

  if (fieldMeta['cellRenderer'] !== null && !isEmptyObject(contents)) {
    const cellRendererField = fieldMeta['cellRenderer']
    return createCellRenderer(cellRendererField, tableData)

  } else if (fieldMeta['relationshipBox']) {
    return (
      <HoverOverlay
        placement='autoVertical'
        contents={ <FormatTooltip contents={ contents } /> }
      >
        <div id={attributes['uid']} className='link-box' key={ initialEndpoint }>
          {text}
        </div>
      </HoverOverlay>
    )
  }
  // basic text or loading wheel
  return checkAndAutoConvertText(text)
}

export default Relationship;
