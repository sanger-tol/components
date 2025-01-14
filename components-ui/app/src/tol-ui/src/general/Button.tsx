/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button as RsButton} from 'rsuite';
import { TolLoader, HoverOverlay, Icon } from '../index';


interface Props {
  icon?: string,
  onClick: () => void,
  className?: string,
  text?: string,
  disabled?: boolean,
  size?: 'md' | 'lg',
  type?: string,
  active?: boolean
  position?: 'left' | 'right'
  tooltip?: string,
  disabledTooltip?: string,
  loading?: boolean,
  outline?: boolean,
  children?: React.ReactNode
}

function Button(props: Props) {
  const { 
    icon,
    onClick,
    className,
    text,
    disabled,
    size,
    type,
    active,
    position = 'left',
    tooltip,
    disabledTooltip,
    loading,
    outline
  } = props;

  const outlineClass = outline ? '-outline' : '';

  const loader = (
    <TolLoader
      size="sm"
    />
  )
  
  const button = (
    <RsButton
      onClick={onClick}
      disabled={disabled || loading}
      active={active}
      className={`icon-button-${type || 'config'}-${size || 'md'}${outlineClass} ${className}`}
    >
      {loading ? (
      loader
    ) : (
      <>
        <div style={{ marginRight: '5px' }}>
          <Icon icon={icon} size={size} />
        </div>
        {text}
      </>
    )}
    </RsButton>
  );

  const contents = disabled && disabledTooltip ? disabledTooltip : tooltip;

  return (
    <div 
    style={{ 
      float: position,
      marginLeft: position === 'right' ? '6px' : '0px', 
      marginRight: position === 'left' ? '6px' : '0px' 
    }}
    >
      {contents ? (
        <HoverOverlay contents={contents!} followCursor={disabled}>
          <div className='tooltip-wrapper'>
            {button}
          </div>
        </HoverOverlay>
      ) : (
        button
      )}
    </div>
  );

}

export default Button;