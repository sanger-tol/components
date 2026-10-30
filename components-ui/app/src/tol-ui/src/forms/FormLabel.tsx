/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faRobot } from "@fortawesome/free-solid-svg-icons";
import { RSForm, IFormComponent, Icon, RequiredAsterisk } from "..";
import { FormOptionsContext } from "./FormOptionsContext";

export interface PFormLabel
  extends Pick<
    IFormComponent,
    "label" | "icon" | "required" | "requiredAsText" | "readOnly" | "automatic"
  > {
  inline?: boolean;
}

export function FormLabel(props: PFormLabel) {
  const { label, inline, required, readOnly, automatic } = props;
  const formOptions = useContext(FormOptionsContext);
  const requiredAsText =
    props.requiredAsText ?? formOptions.requiredAsText ?? false;
  const showReadOnly = Boolean(
    readOnly &&
      !automatic &&
      !formOptions.locked &&
      !formOptions.sectionLocked,
  );
  const showRequired = Boolean(required && !readOnly);
  const showRequiredAsText = showRequired && requiredAsText;

  const icon = { ...props.icon, position: props.icon?.position || "right" };

  return (
    <>
      {label && (
        <RSForm.ControlLabel>
          <div className={`tol-form-label ${inline ? "inline" : ""} ${showRequiredAsText ? "required-as-text" : ""}`}>
            {showRequired && !requiredAsText && <RequiredAsterisk />}
            {icon.position === "right" && label}
            {icon.icon && (
              <div className="tol-form-label-icon">
                <Icon icon={icon.icon} size={icon.size} config={icon.config} />
              </div>
            )}
            {icon.position === "left" && label}
            {showRequiredAsText && <span className="tol-form-label-required-text">Required</span>}
            {showReadOnly && (
              <span className="tol-form-label-read-only">
                <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                <em>Read-only</em>
              </span>
            )}
            {automatic && (
              <span className="tol-form-label-automatic">
                <FontAwesomeIcon icon={faRobot} aria-hidden="true" />
                <em>Auto-generated</em>
              </span>
            )}
          </div>
        </RSForm.ControlLabel>
      )}
    </>
  );
}
