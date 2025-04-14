/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { InlineEdit } from '.'
import { IInlineEdit } from './InlineEdit'
import { IButton } from './Button'
import { IDropdownButtons } from './DropdownButtons'
import { Button, DropdownButtons } from '../'


export interface IUtilityBar {
  title?: IInlineEdit;
  buttons?: (IButton | IDropdownButtons | undefined)[];
  elements?: JSX.Element[];
}

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
      <div className='tol-utility-bar-buttons'>
        {buttons && buttons.map((button, index) => {
          if (button) {
            if ('dropdownButtons' in button) {
              return (
                <div style={{float: 'right', marginLeft: '6px'}}>
                  <DropdownButtons key={index} {...button} />
                </div>
              )
            }
            return (
              <Button key={index} {...button} className='tol-utility-bar-button'/>
            )
          }
        })}
      </div>
    </div>
  );
}

export default UtilityBar;
