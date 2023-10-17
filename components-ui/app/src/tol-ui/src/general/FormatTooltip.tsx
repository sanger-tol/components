/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { formatDate, normaliseCaps } from './Utils'


const updateContents = (contents: object) => {
  for (const [key, value] of Object.entries(contents)) {
    // remove or format some content
    switch (key) {
      case "history":
        delete contents[key]
        break
      case "last_modified_at":
      case "created_at":
        contents[key] = formatDate(value)
        break
    }
    // make nulls show a faded 'None'
    if (!value) {
      contents[key] = <span className="tooltip-value-none">None</span>
    }
  }
  return contents
}

interface Props {
  contents: object
}

function FormatTooltip(props: Props) {
  return (
    <div>
      {Object.entries(updateContents(props.contents)).map(([key, value]) => (
        <div className='formatted-tooltip' key={ key }>
          <span className='tooltip-key'>{ normaliseCaps(key) }:</span>
          <span className='tooltip-value'>{ value }</span>
        </div>
      ))}
    </div>
  );
}

export default FormatTooltip;
