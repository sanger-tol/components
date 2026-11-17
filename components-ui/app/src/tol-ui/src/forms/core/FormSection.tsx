/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

/** Props for a titled group of form fields. */
export interface PFormSection {
  /** Section id, used for the element id. */
  id: string;
  /** Section heading. */
  title: string;
  /** Shows a read-only badge in the heading. */
  locked?: boolean;
  /** Shows an optional badge in the heading. Ignored when `locked`. */
  optional?: boolean;
  /** The section's fields. */
  children: React.ReactNode;
}

// A titled group of fields, with a read-only or optional badge in the heading.
export function FormSection(props: PFormSection) {
  const { children, id, locked, optional, title } = props;

  return (
    <div
      id={`section-${id}`}
      className="tol-form-wrapper-unique-sections-container"
    >
      <div className="tol-form-wrapper-unique-sections-header">
        <h5>
          {title}
          {locked ? (
            <span className="tol-form-section-read-only">
              <FontAwesomeIcon icon={faLock} aria-hidden="true" />
              <em>Read-only</em>
            </span>
          ) : (
            optional && (
              <span className="tol-form-section-optional">
                {" "}
                <em>Optional</em>
              </span>
            )
          )}
        </h5>
      </div>

      {children}
    </div>
  );
}
