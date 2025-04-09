/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IUtilityBar } from '../models'
import { InlineEdit } from '.'
import { Button, DropdownButtons } from '../'

function UtilityBar(props: IUtilityBar) {
  const {
    title,
    buttons,
    elements
  } = props;

  return (
    <div className='tol-utility-bar'>
      {title && <InlineEdit {...title} />}
      {elements && elements.map((element, index) => (
        <div key={index} style={{ float: 'left' }}>
          {element}
        </div>
      ))}
      {buttons && buttons.map((button, index) => {
        if (button) {
          if ('dropdownButtons' in button) {
            return (
              <DropdownButtons key={index} {...button} />
            )
          }
          return (
            <Button key={index} {...button} />
          )
        }
      })}
    </div>
  );
}

export default UtilityBar;
