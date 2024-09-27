/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import ReactMarkdown from 'react-markdown'


export interface Props {
  contents: string
}

function Markdown(props: Props) {
  const { contents } = props;

  return (
    <ReactMarkdown className="tol-markdown">
      {contents}
    </ReactMarkdown>
  )
}

export default Markdown;
