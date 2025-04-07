/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IUtilityBar } from '../models'
import { InlineEdit } from '.'
import { Button } from '../'

function UtilityBar(props: IUtilityBar) {
  const {
    title,
    buttons,
    elements
  } = props;

  return (
    <div className='tol-table-bar'>
      {title && <InlineEdit {...title} />}
      {elements && elements.map((element, index) => (
        <div key={index} style={{ float: 'left'}}>
          {element}
        </div>
      ))}
      {buttons && buttons.map((button, index) => (
        <Button key={index} {...button}/>
      ))}
    </div>
  );
}

export default UtilityBar;
