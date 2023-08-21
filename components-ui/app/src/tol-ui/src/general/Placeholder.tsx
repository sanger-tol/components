/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faChartPie } from '@fortawesome/free-solid-svg-icons';


interface Props {
  bar?: boolean,
  pie?: boolean,
  empty?: boolean,
  height?: number
}

function getPlaceholderIcon(bar: boolean|undefined, pie: boolean|undefined) {
  if(bar) {
    return <FontAwesomeIcon icon={faChartColumn} size="8x" />
  } else if (pie) {
    return <FontAwesomeIcon icon={faChartPie} size="8x" />
  } else {
    return <></>
  }
}

function getPlaceholder(icon: JSX.Element) {
  return (
    <div className="tol-placeholder">
      <div className="tol-placeholder-icons">
        {icon}
      </div>
    </div>
  )
}

function Placeholder(props: Props) {
  const { bar, pie, empty, height } = props

  // setting height of placeholder if set - default fits to parent div
  let heightCss = {}
  if (height !== undefined) {
    heightCss = {height: height.toString() + 'px'}
  }

  // this temporarily fills a gap on load
  if (empty) {
    return <div style={heightCss}/>
  }

  const icon = getPlaceholderIcon(bar, pie)

  // set parent div for height
  if (height !== undefined) {
    return (
      <div style={heightCss}>
        {getPlaceholder(icon)}
      </div>
    )
  } else {
    return getPlaceholder(icon)
  }
}

export default Placeholder;

