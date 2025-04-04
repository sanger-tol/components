/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IButton, IInlineEdit } from '../models'
import { InlineEdit } from '.'
import { Button } from '../'

interface Props {
  title?: IInlineEdit;
  buttons: IButton[];
  elements: JSX.Element[];
}

function UtilityBar(props: Props) {
  const {
    title,
    buttons,
    elements
  } = props;

  return (
    <div className='tol-table-bar'>
      {title && <InlineEdit {...title} />}
      {elements.map((element, index) => (
        <div key={index}>
          {element}
        </div>
      ))}
      {buttons.map((button, index) => (
        <Button key={index} {...button}/>
      ))}
    </div>
  );
}

export default UtilityBar;
