/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { InfoIcon } from './Icons';
import HoverOverlay from './HoverOverlay';
import Markdown from './Markdown';


interface Props {
  systemName: string,
  description: string,
  sourceName: string,
  typeData: string,
  disableMarkdown?: boolean
}

function InfoTooltipEx(props: Props) {
  const { systemName, description, sourceName, typeData, disableMarkdown  } = props;

  // to use a variable use {variable}

  const renderedContents = (disableMarkdown === true) ? systemName : (
    <div><strong>Source name:</strong>{sourceName}<br /><strong>Description:</strong>{description}<br /><strong>System name:</strong>{systemName}<br /><strong>Type:</strong>{typeData}</div>
  );

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <HoverOverlay
        contents={renderedContents}
      >
        <div className='tooltip-wrapper'>
          <InfoIcon />
        </div>
      </HoverOverlay>
    </span>

  );
}

export default InfoTooltipEx;
