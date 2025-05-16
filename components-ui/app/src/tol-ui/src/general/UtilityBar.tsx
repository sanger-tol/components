/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react'
import { ClickOverlay, InlineEdit } from '.'
import { IInlineEdit } from './InlineEdit'
import { IButton } from './Button'
import { IDropdownButtons } from './DropdownButtons'
import { Button, DropdownButtons, resizeListener } from '../'


export interface IUtilityBar {
  id?: string;
  title?: IInlineEdit;
  buttons?: (IButton | IDropdownButtons | undefined)[];
  elements?: JSX.Element[];
}

export function UtilityBar(props: IUtilityBar) {
  const {
    id,
    title,
    buttons,
    elements
  } = props;

  const wrapperId = "tol-utility-bar-wrapper-" + id; // gets width on mount
  const [smallBreakpoint, setSmallBreakpoint] = useState(true);
  
  resizeListener(() => {
    const width = document.getElementById(wrapperId)?.offsetWidth;
    if (width !== undefined) setSmallBreakpoint(width < 600);
  });

  const Buttons = (
    // remove left-most button margin
    <div style={{marginLeft: '-6px'}}>
      {buttons && buttons.map((button, index) => {
        if (button) {
          if ('dropdownButtons' in button) {
            return (
              <div style={{float: 'right', marginLeft: '6px'}} key={index}>
                <DropdownButtons {...button} />
              </div>
            )
          }
          return (
            <Button key={index} {...button} className='tol-utility-bar-button'/>
          )
        }
      })}
    </div>
  )

  const CondensedButtons = (
    <ClickOverlay contents={Buttons} closeOnClick>
      <div style={{float: "right"}}>
        <Button
          outline
          position="right"
          type="primary"
          icon="ellipsis-vertical"
        />
      </div>
    </ClickOverlay>
  )

  return (
    <div className='tol-utility-bar' id={wrapperId}>
      {title &&
        <InlineEdit
          {...title}
          size={smallBreakpoint ? 'sm' : 'md'}
        />
      }
      {elements && elements.map((element, index) => (
        <div key={index} style={{ float: 'left' }}>
          {element}
        </div>
      ))}
      <div className='tol-utility-bar-buttons'>
        {
          (
            smallBreakpoint &&
            buttons &&
            // only takes into account buttons that are not hidden
            buttons.filter(button => button?.['visible'] !== false).length > 1
          )
          ? CondensedButtons
          : Buttons
        }
      </div>
    </div>
  );
}
