/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RSForm, IFormComponent, Icon, RequiredAsterisk } from "..";

export interface PFormLabel extends Pick<IFormComponent, "label" | "icon" | "required"> {
  inline?: boolean;
}

export function FormLabel(props: PFormLabel) {
  const { label, inline, required } = props;

  const icon = { ...props.icon, position: props.icon?.position || "right" };

  return (
    <>
      {label && (
        <RSForm.ControlLabel>
          <div className={`tol-form-label ${inline ? "inline" : ""}`}>
            {required && <RequiredAsterisk />}
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
