/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IButton, IInlineEdit } from '../models'
import { InlineEdit } from '.'
import { Button } from '../'

interface Props {
  title: IInlineEdit;
  buttons: IButton[];
}

function UtilityBar(props: Props) {
  const {
    title,
    buttons
  } = props;

  return (
    <div>
      <InlineEdit {...title}/>
      {buttons.map((button, index) => (
        <Button key={index} {...button}/>
      ))}
    </div>
  );
}

export default UtilityBar;
