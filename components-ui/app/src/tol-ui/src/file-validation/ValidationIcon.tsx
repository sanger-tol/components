/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "../index";

export type IconType = "check" | "xmark" | "question";

// TODO: Change ValidationIcon style to className
// TODO: Create size type

interface Props {
  iconType: IconType;
  size?: string;
  style?: React.CSSProperties;
  className?: string;
}

function ValidationIcon(props: Props) {
  const { iconType = "check", size = "sm", style, className="" } = props;
  return (
    <div>
      <span style={{ ...style }} className={className}>{<Icon icon={iconType} size={size} />}</span>
    </div>
  );
}

export default ValidationIcon;
