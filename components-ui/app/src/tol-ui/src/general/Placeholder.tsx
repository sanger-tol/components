/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface Props {
  circle?: boolean,
  empty?: boolean,
  height?: number
}

function Placeholder(props: Props) {
  const { circle, empty, height } = props

  // setting height of placeholder if set - default fits to parent div
  let heightCss = {}
  if (height !== undefined) {
    heightCss = {height: height.toString() + 'px'}
  }

  // this temporarily fills a gap on load
  if (empty) {
    return <div style={heightCss}/>
  }

  // set parent div for height
  if (height !== undefined) {
    return (
      <div style={heightCss}>
        <div className="tol-placeholder-rect">
          {circle ?
            <div className="tol-placeholder-doughnut" />
          :
            <></>
          }
        </div>
      </div>
    )
  } else {
    return (
      <div className="tol-placeholder-rect">
        {circle ?
          <div className="tol-placeholder-doughnut" />
        :
          <></>
        }
      </div>
    )
  }
}

export default Placeholder;

