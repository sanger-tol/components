/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faChartPie, faMapLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Loader, Status } from '../index';


function getPlaceholderIcon(
  bar?: boolean,
  pie?: boolean,
  map?: boolean,
  loader?: boolean,
  message?: string,
  warningMessage?: string,
  errorMessage?: string
) {
  if (bar) {
    return <FontAwesomeIcon icon={faChartColumn} size="8x" />;
  } else if (pie) {
    return <FontAwesomeIcon icon={faChartPie} size="8x" />;
  } else if (map) {
    return <FontAwesomeIcon icon={faMapLocationDot} size="8x"/>;
  } else if (loader) {
    return <Loader />;
  } else if (message !== undefined){
    return <h5>{message}</h5>;
  } else if (warningMessage !== undefined) {
    return <Status status="warning" text={warningMessage} />;
  } else if (errorMessage !== undefined) {
    return <Status status="danger" text={errorMessage} />;
  } else {
    return <></>;
  }
}

function getPlaceholder(
  height: number,
  icon: JSX.Element,
  backing?: JSX.Element,
  opacity?: number,
  squareCorners?: boolean
) {
  const style = {};
  if (opacity) style["opacity"] = opacity;
  if (squareCorners !== true) style["borderRadius"] = 6;

  // default placeholder
  if (backing === undefined) {
    return (
      <div style={{height: height.toString() + 'px'}}>
        <div className="tol-placeholder" style={style}>
          <div className="tol-placeholder-icons">
            {icon}
          </div>
        </div>
      </div>
    );
  }

  // adding a faded background to the backing contents (e.g. map behind loading)
  return (
    <div className="overlay-outer">
      <div className="overlay-top" style={{zIndex: 1002}}>
        <div style={{height: height.toString() + 'px'}}>
          <div className="tol-placeholder-empty">
            <div className="tol-placeholder-icons">
              {icon}
            </div>
          </div>
        </div>
      </div>
      <div className="overlay-top" style={{zIndex: 1001}}>
        <div style={{height: height.toString() + 'px'}}>
          <div className="tol-placeholder" style={style} />
        </div>
      </div>
      {backing}
    </div>
  );
}

interface Props {
  bar?: boolean,
  pie?: boolean,
  map?: boolean,
  empty?: boolean,
  loader?: boolean,
  opacity?: number,
  squareCorners?: boolean,
  message?: string,
  warningMessage?: string,
  errorMessage?: string,
  backing?: JSX.Element,
  height: number
}

function Placeholder(props: Props) {
  const { bar,
    pie,
    map,
    empty,
    loader,
    opacity,
    squareCorners,
    message,
    warningMessage,
    errorMessage,
    backing,
    height } = props;

  // this temporarily fills a gap - used for on load
  if (empty) {
    return <div style={{height: height.toString() + 'px'}}/>;
  }

  const icon = getPlaceholderIcon(
    bar,
    pie,
    map,
    loader,
    message,
    warningMessage,
    errorMessage
  );

  return getPlaceholder(
    height,
    icon,
    backing,
    opacity,
    squareCorners
  );
}

export default Placeholder;
