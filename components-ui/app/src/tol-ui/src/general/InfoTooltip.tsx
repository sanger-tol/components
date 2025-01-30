/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { InfoIcon } from './Icons';
import HoverOverlay from './HoverOverlay';
import Markdown from './Markdown';


interface Props {
  contents: string,
  disableMarkdown?: boolean
}

function InfoTooltip(props: Props) {
  const { contents, disableMarkdown } = props;

  const renderedContents = (disableMarkdown === true) ? contents : (
    <Markdown contents={contents}></Markdown>
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

export default InfoTooltip;
