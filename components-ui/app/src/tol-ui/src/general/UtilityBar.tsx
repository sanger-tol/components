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
  } = props;

  return (
    <div>
      {title && <InlineEdit {...title} />}
      {buttons.map((button, index) => (
        <Button key={index} {...button}/>
      ))}
      {props.elements.map((element, index) => (
        <div key={index}>
          {element}
        </div>
      ))}
    </div>
  );
}

export default UtilityBar;
