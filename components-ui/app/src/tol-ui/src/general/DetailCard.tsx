/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";

import type { IDetailCardField } from "..";

export interface PDetailCard {
  /** Card heading. */
  title?: string;
  /** Supporting text displayed below the heading. */
  description?: string;
  /** Structured label-value details. Nullish values are omitted. */
  fields?: IDetailCardField[];
  /** Additional card content. */
  children?: ReactNode;
}

/**
 * @autodoc
 *
 * Displays structured details in a consistent, natural-height card.
 */
export function DetailCard({
  title,
  description,
  fields = [],
  children,
}: PDetailCard) {
  const visibleFields = fields.filter(
    ({ value }) => value !== undefined && value !== null,
  );

  return (
    <div className="tol-detail-card">
      {(title || description) && (
        <div className="tol-detail-card__header">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}
      {visibleFields.length > 0 && (
        <div className="tol-detail-card__fields">
          {visibleFields.map((field, index) => (
            <div key={field.id ?? index} className="tol-detail-card__field">
              <span className="tol-detail-card__label">{field.label}:</span>
              <span className="tol-detail-card__value">{field.value}</span>
            </div>
          ))}
        </div>
      )}
      {children && <div className="tol-detail-card__body">{children}</div>}
    </div>
  );
}
