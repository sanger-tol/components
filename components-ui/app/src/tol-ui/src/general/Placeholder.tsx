/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faChartPie, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import { getCssVarValue } from "./Utils";


interface Props {
  bar?: boolean,
  pie?: boolean,
  map?: boolean,
  empty?: boolean,
  height?: number,
  opacity?: number,
  message?: string
}

function getPlaceholderIcon(
  bar?: boolean,
  pie?: boolean,
  map?: boolean,
  message?: string
) {
  if(bar) {
    return <FontAwesomeIcon icon={faChartColumn} size="8x" />
  } else if (pie) {
    return <FontAwesomeIcon icon={faChartPie} size="8x" />
  } else if (map) {
    return <FontAwesomeIcon icon={faMapLocationDot} size="8x"/>
  } else if (message !== undefined){
    return <h4 className="placeholder-text">{message}</h4>
  } else {
    return <></>
  }
}

function getPlaceholder(icon: JSX.Element, opacity?: number) {
  if (!opacity){
    return (
      <div className="tol-placeholder">
        <div className="tol-placeholder-icons">
          {icon}
        </div>
      </div>
    )
  } else {
    return (
      <div className="tol-placeholder" style={{backgroundColor: getCssVarValue('--grey')}}>
        <div className="tol-placeholder-icons">
          {icon}
        </div>
      </div>
    )
  }
}

function Placeholder(props: Props) {
  const { bar, pie, map, empty, height, opacity, message } = props

  // setting height of placeholder if set - default fits to parent div
  let heightCss = {}
  if (height !== undefined) {
    heightCss = {height: height.toString() + 'px'}
  }

  // setting the opacity of the placeholder
  if (opacity !== undefined) {
    heightCss['opacity'] = opacity
  }


  // this temporarily fills a gap on load
  if (empty) {
    return <div style={heightCss}/>
  }

  const icon = getPlaceholderIcon(bar, pie, map, message)

  // set parent div for height
  if (height !== undefined) {
    return (
      <div style={heightCss}>
        {getPlaceholder(icon, opacity)}
      </div>
    )
  } else {
    return getPlaceholder(icon, opacity)
  }

}



export default Placeholder;

