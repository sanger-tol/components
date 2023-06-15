/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { httpClient } from '../services/http/httpClient'
import HoverOverlay from '../general/HoverOverlay';
import FormatRelationshipTooltip from './FormatRelationshipTooltip';
import { normaliseCaps,
         createCellRenderer,
         isEmptyObj } from './TableUtils'
import { Placeholder } from 'rsuite';


export interface Props {
  initialEndpoint: string,
  relationships: string[],
  attributes: object,
  fieldMeta: object
}

export interface State {
  text: JSX.Element|string,
  contents: object,
  tableData: object
}

class RelationshipLink extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      text: <Placeholder />,
      contents: {},
      tableData: this.props.attributes
    }
  }

  componentDidMount() {
    this.handleRelationshipLoading()
  }

  handleRelationshipLoading = async ()  => {
    const { initialEndpoint, relationships } = this.props;
    let attribute = '';
    if (relationships.length !== 1) {
      attribute = relationships.pop()!
    }
    const relationshipTotal = relationships.length
    let endpoint = initialEndpoint

    for (let count = 0; count < relationshipTotal; count++) {
      await httpClient().get(endpoint)
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
            this.setState({
              text: 'ERROR: See console',
              contents: { ERROR: 'See console' },
              tableData: { ERROR: 'See console' }
            })
            throw Error('Attribute \'' + attribute + '\' cannot be found in \'' +
                        relationships[count] + '\'')
          }

          // please note that the object used is passed by reference
          this.state.tableData[relationships[count]] = currentAttributes

          this.setState({
            text: displayText,
            contents: currentAttributes
          })
          
        } else {
          // assign detail endpoint where relationship title is
          const regex = /^\/([^]*)\/.*/
          const endpointObject = relationships[count+1].replace(regex, '$1')
          endpoint = data.relationships[endpointObject]['links']['related']
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
    }
  }

  render() {
    return (
      <div>
        {(() => {
          const fieldMeta = this.props.fieldMeta
          if (fieldMeta['cellRenderer'] !== null && !isEmptyObj(this.state.contents)) {
            const cellRendererField = fieldMeta['cellRenderer']
            return createCellRenderer(cellRendererField, this.state.tableData)
          // relationshipBox rendered if true or for 'auto generated' AutoTable
          } else if (fieldMeta['relationshipBox']) {
            return (
              <HoverOverlay
                placement='autoHorizontalStart'
                contents={ <FormatRelationshipTooltip contents={ this.state.contents } /> }
              >
                <div className='link-box' key={ this.props.initialEndpoint }>
                  { this.state.text }
                </div>
              </HoverOverlay>
            )
          // basic text or loading wheel
          } else {
            return <div>{ this.state.text }</div>
          }
        })()}
      </div>
    );
  }
}

export default RelationshipLink;
