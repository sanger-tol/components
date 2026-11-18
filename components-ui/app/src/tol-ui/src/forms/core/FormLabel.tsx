/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import {
  RSForm,
  Icon,
  RequiredAsterisk,
  FormOptionsContext,
  isEmptyFieldValue,
} from "../..";
import type { IFormComponent } from "../..";

/** Props for the FormLabel component. */
export interface PFormLabel extends Pick<
  IFormComponent,
  | "label"
  | "icon"
  | "required"
  | "requiredAsText"
  | "readOnly"
  | "automatic"
  | "recommended"
> {
  /** Whether the label should be displayed inline with the field. */
  inline?: boolean;
  /** Current field value; empty read-only fields display "Locked". */
  value?: unknown;
}

/** Renders a label for a form field, including icons, required indicators, and read-only/automatic/recommended status. */
export function FormLabel(props: PFormLabel) {
  const { label, inline, required, readOnly, automatic, recommended } = props;
  const formOptions = useContext(FormOptionsContext);

  const requiredAsText =
    props.requiredAsText ?? formOptions.requiredAsText ?? false;

  const locked = Boolean(
    readOnly || formOptions.locked || formOptions.sectionLocked,
  );
  const emptyLocked = locked && isEmptyFieldValue(props.value);

  const showReadOnly =
    !automatic &&
    (emptyLocked ||
      Boolean(readOnly && !formOptions.locked && !formOptions.sectionLocked));
  const showRequired = Boolean(required && !readOnly);
  const showRequiredAsText = showRequired && requiredAsText;
  const showRecommended = recommended && !automatic && !locked;

  const icon = { ...props.icon, position: props.icon?.position || "right" };

  return (
    <>
      {label && (
        <RSForm.ControlLabel>
          <div
            className={`tol-form-label ${inline ? "inline" : ""} ${showRequiredAsText ? "required-as-text" : ""}`}
          >
            {showRequired && !requiredAsText && <RequiredAsterisk />}
            {icon.position === "right" && label}
            {icon.icon && (
              <div className="tol-form-label-icon">
                <Icon icon={icon.icon} size={icon.size} config={icon.config} />
              </div>
            )}
            {icon.position === "left" && label}
            {showRequiredAsText && (
              <span className="tol-form-label-required-text">Required</span>
            )}
            {showReadOnly && (
              <span className="tol-form-label-read-only">
                <Icon icon={"lock"} aria-hidden="true" />
                <em>{emptyLocked ? "Locked" : "Read-only"}</em>
              </span>
            )}
            {automatic && (
              <span className="tol-form-label-automatic">
                <Icon icon={"robot"} aria-hidden="true" />
                <em>Auto-generated</em>
              </span>
            )}
            {showRecommended && (
              <span className="tol-form-label-recommended">
                <em>Recommended</em>
              </span>
            )}
          </div>
        </RSForm.ControlLabel>
      )}
    </>
  );
}
