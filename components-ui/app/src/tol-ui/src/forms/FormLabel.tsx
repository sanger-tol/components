/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RSForm, IFormLabelIcon, Icon } from "..";

export interface PFormLabel {
  label?: string;
  icon?: IFormLabelIcon;
}

export function FormLabel(props: PFormLabel) {
  const { label } = props;

  const icon = { ...props.icon, position: props.icon?.position || "right" };
  
  return (
    <>
      {label && (
        <RSForm.ControlLabel>
          <div className="tol-form-label">
            {icon.position === "right" && label}
            {icon.icon && (
              <div className="tol-form-label-icon">
                <Icon icon={icon.icon} size={icon.size} config={icon.config} />
              </div>
            )}
            {icon.position === "left" && label}
          </div>
        </RSForm.ControlLabel>
      )}
    </>
  );
}
